const { withTransaction } = require("../utils/database");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signJwt } = require("../utils/jwt");
const { eventLog } = require("../utils/eventLog");
const { AuthError, ConflictError } = require("../errors");

const { userRepository } = require("../repositories/userRepository");
const { personRepository } = require("../repositories/personRepository");

async function register(req, res) {
  const { username, password, firstName, lastName, email, personnummer } = req.body;

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
      role: "applicant",
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

async function login(req, res) {
  const { username, password } = req.body;
  const user = await userRepository.findByUsername(username);

  const ok = user ? await verifyPassword(password, user.password_hash) : false;
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
    },
  });
}

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

module.exports = { register, login, me };
