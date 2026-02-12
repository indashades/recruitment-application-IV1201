const { withTransaction } = require("../utils/database");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signJwt } = require("../utils/jwt");
const { eventLog } = require("../utils/eventLog");
const { AuthError, ConflictError } = require("../errors");

const { userRepository } = require("../repositories/userRepository");
const { personRepository } = require("../repositories/personRepository");

const { generateRawRecoveryToken, hashRecoveryToken, getRecoveryExpiresAt, buildRecoveryLink } = require("../utils/recoveryToken");
const { sendRecoveryEmail } = require("../services/emailService");
const { recoveryTokenRepository } = require("../repositories/recoveryTokenRepository");

/**
 * Registers a new applicant account.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>} Sends HTTP 201 with created user metadata.
 * @throws {ConflictError} If username already exists.
 */
async function register(req, res) {
    const {
    username,
    password,
    firstName,
    lastName,
    email,
    personnummer,
    role = "applicant",
  } = req.body;

  const existing = await userRepository.findByUsername(username);
  if (existing) {
    throw new ConflictError("Username already exists", { fields: ["username"] });
  }

  const passwordHash = await hashPassword(password);

  const created = await withTransaction(async (client) => {
    const person = await personRepository.createPerson(client, {
      firstName,
      lastName,
      email,
      personnummer,
    });
    const user = await userRepository.createUserAccount(client, {
      personId: person.id,
      username,
      passwordHash,
      role,
    });
    return { person, user };
  });

  eventLog("account_created", {
    requestId: req.requestId,
    userId: created.user.id,
    role: created.user.role,
  });

  res.status(201).json({
    message: "Account created",
    data: {
      user: {
        userId: created.user.id,
        username: created.user.username,
        role: created.user.role,
        personId: created.user.person_id,
      },
    },
  });
}

/**
 * Authenticates a user and returns a signed JWT.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>} Sends HTTP 200 with token and role.
 * @throws {AuthError} If credentials are invalid.
 */
async function login(req, res) {
  const { username, password } = req.body;
  const user = await userRepository.findByUsername(username);

  if (!user) {
    eventLog("login_attempt", {
      requestId: req.requestId,
      username,
      success: false,
      reason: "NO_USER",
    });
    throw new AuthError("Invalid credentials", { code: "AUTH_INVALID" });
  }

  if (user.needs_password_reset) {
    eventLog("login_attempt", {
      requestId: req.requestId,
      username,
      success: false,
      reason: "PASSWORD_RESET_REQUIRED",
    });
    throw new AuthError("Password reset required", {
      code: "AUTH_PASSWORD_RESET_REQUIRED",
    });
  }

  const ok = await verifyPassword(password, user.password_hash);

  eventLog("login_attempt", {
    requestId: req.requestId,
    username,
    success: ok,
  });

  if (!ok) {
    throw new AuthError("Invalid credentials", { code: "AUTH_INVALID" });
  }

  const token = signJwt({
    userId: user.id,
    role: user.role,
    personId: user.person_id,
  });

  res.json({
    message: "Login successful",
    data: {
      token,
      role: user.role,
      needsPasswordReset: false,
    },
  });
}

function getRequestIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || null;
}

function genericRecoveryResponse(res) {
  return res.json({
    message: "If an account exists, a recovery email has been sent",
    data: { accepted: true },
  });
}

/**
 * Requests account recovery email.
 * Route: POST /auth/recovery/request
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
async function requestRecovery(req, res) {
  const identifier = req.body.identifier.trim();

  const user = await userRepository.findByIdentifier(identifier);
  if (!user || !user.email) {
    eventLog("auth_recovery_requested", {
      requestId: req.requestId,
      success: false,
      reason: "NO_MATCH_OR_NO_EMAIL",
    });
    return genericRecoveryResponse(res);
  }

  const rawToken = generateRawRecoveryToken();
  const tokenHash = hashRecoveryToken(rawToken);
  const expiresAt = getRecoveryExpiresAt();
  const purpose =
    user.needs_password_reset || !user.password_hash
      ? "set_password"
      : "reset_password";

  await withTransaction(async (client) => {
    await recoveryTokenRepository.create(client, {
      userId: user.id,
      tokenHash,
      purpose,
      expiresAt,
      requestIp: getRequestIp(req),
      requestUserAgent: req.headers["user-agent"] || null,
    });
  });

  const recoveryLink = buildRecoveryLink(rawToken);

  try {
    await sendRecoveryEmail({
      to: user.email,
      recoveryLink,
      mode: purpose,
    });

    eventLog("auth_recovery_email_sent", {
      requestId: req.requestId,
      userId: user.id,
      purpose,
    });
  } catch (err) {
    // Keep generic response to avoid account enumeration.
    eventLog(
      "auth_recovery_email_failed",
      {
        requestId: req.requestId,
        userId: user.id,
        purpose,
        errorMessage: err && err.message,
      },
      { req, level: "warn", status: 200 }
    );
  }

  return genericRecoveryResponse(res);
}

/**
 * Confirms account recovery by consuming token and setting new password.
 * Route: POST /auth/recovery/confirm
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 * @throws {AuthError} If token is invalid/expired/already used.
 */
async function confirmRecovery(req, res) {
  const { token, newPassword } = req.body;
  const tokenHash = hashRecoveryToken(token);
  const passwordHash = await hashPassword(newPassword);

  const result = await withTransaction(async (client) => {
    const consumed = await recoveryTokenRepository.consumeActiveByTokenHash(client, tokenHash);
    if (!consumed) return null;

    const updatedUser = await userRepository.setPasswordAndClearResetFlag(client, {
      userId: consumed.user_id,
      passwordHash,
    });
    if (!updatedUser) throw new Error("Recovery token references missing user account");

    await recoveryTokenRepository.invalidateActiveTokensForUser(client, consumed.user_id, {
      excludeId: consumed.id,
    });

    return { consumed, updatedUser };
  });

  if (!result) {
    eventLog("auth_recovery_confirmed", {
      requestId: req.requestId,
      success: false,
      reason: "INVALID_OR_EXPIRED_TOKEN",
    });
    throw new AuthError("Invalid or expired recovery token", {
      code: "AUTH_RECOVERY_TOKEN_INVALID",
    });
  }

  const jwtToken = signJwt({
    userId: result.updatedUser.id,
    role: result.updatedUser.role,
    personId: result.updatedUser.person_id,
  });

  eventLog("auth_recovery_confirmed", {
    requestId: req.requestId,
    success: true,
    userId: result.updatedUser.id,
    purpose: result.consumed.purpose,
  });

  res.json({
    message: "Password updated",
    data: {
      token: jwtToken,
      role: result.updatedUser.role,
      needsPasswordReset: false,
    },
  });
}

/**
 * Returns the authenticated user context and linked person profile.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>} Sends HTTP 200 with current user information.
 */
async function me(req, res) {
  const actor = req.user;
  const person = actor && actor.personId
    ? await personRepository.getPersonDisplayById(actor.personId)
    : null;

  res.json({
    message: "Current user",
    data: {
      user: actor,
      person: person
        ? {
            personId: person.id,
            firstName: person.first_name,
            lastName: person.last_name,
            email: person.email,
          }
        : null,
    },
  });
}

module.exports = { register, login, me, requestRecovery, confirmRecovery };