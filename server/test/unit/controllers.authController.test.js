jest.mock("../../src/utils/database", () => ({
  withTransaction: jest.fn(),
}));

jest.mock("../../src/utils/password", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

jest.mock("../../src/utils/jwt", () => ({
  signJwt: jest.fn(),
}));

jest.mock("../../src/utils/eventLog", () => ({
  eventLog: jest.fn(),
}));

jest.mock("../../src/repositories/userRepository", () => ({
  userRepository: {
    findByUsername: jest.fn(),
    createUserAccount: jest.fn(),
    findByIdentifier: jest.fn(),
    setPasswordAndClearResetFlag: jest.fn(),
  },
}));

jest.mock("../../src/repositories/personRepository", () => ({
  personRepository: {
    createPerson: jest.fn(),
    getPersonDisplayById: jest.fn(),
  },
}));

jest.mock("../../src/repositories/recoveryTokenRepository", () => ({
  recoveryTokenRepository: {
    create: jest.fn(),
    consumeActiveByTokenHash: jest.fn(),
    invalidateActiveTokensForUser: jest.fn(),
  },
}));

jest.mock("../../src/services/emailService", () => ({
  sendRecoveryEmail: jest.fn(),
}));

const { ConflictError, AuthError } = require("../../src/errors");
const { withTransaction } = require("../../src/utils/database");
const { hashPassword, verifyPassword } = require("../../src/utils/password");
const { signJwt } = require("../../src/utils/jwt");
const { userRepository } = require("../../src/repositories/userRepository");
const { personRepository } = require("../../src/repositories/personRepository");
const { recoveryTokenRepository } = require("../../src/repositories/recoveryTokenRepository");
const { sendRecoveryEmail } = require("../../src/services/emailService");
const { register, login, me, requestRecovery, confirmRecovery } = require("../../src/controllers/authController");

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("controllers/authController", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    withTransaction.mockImplementation(async (fn) => fn({ query: jest.fn(), release: jest.fn() }));
    hashPassword.mockResolvedValue("hashed-value");
    verifyPassword.mockResolvedValue(true);
    signJwt.mockReturnValue("jwt-token");

    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.createUserAccount.mockResolvedValue({
      id: 7,
      person_id: 9,
      username: "ada",
      role: "applicant",
    });
    userRepository.findByIdentifier.mockResolvedValue(null);
    userRepository.setPasswordAndClearResetFlag.mockResolvedValue({
      id: 7,
      person_id: 9,
      username: "ada",
      role: "applicant",
      needs_password_reset: false,
    });

    personRepository.createPerson.mockResolvedValue({
      id: 9,
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
    });
    personRepository.getPersonDisplayById.mockResolvedValue({
      id: 9,
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
    });

    recoveryTokenRepository.create.mockResolvedValue({
      id: 99,
      user_id: 7,
      purpose: "reset_password",
      expires_at: "2026-03-02T12:00:00.000Z",
      used_at: null,
      created_at: "2026-03-02T11:00:00.000Z",
    });
    recoveryTokenRepository.consumeActiveByTokenHash.mockResolvedValue({
      id: 99,
      user_id: 7,
      purpose: "reset_password",
      expires_at: "2026-03-02T12:00:00.000Z",
      created_at: "2026-03-02T11:00:00.000Z",
    });
    recoveryTokenRepository.invalidateActiveTokensForUser.mockResolvedValue();

    sendRecoveryEmail.mockResolvedValue();
  });

  test("register creates a person and user account and returns 201", async () => {
    const req = {
      body: {
        username: "ada",
        password: "password123",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        personnummer: "199001011234",
      },
      requestId: "req-1",
    };
    const res = makeRes();

    await register(req, res);

    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(personRepository.createPerson).toHaveBeenCalled();
    expect(userRepository.createUserAccount).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Account created",
      data: {
        user: {
          userId: 7,
          username: "ada",
          role: "applicant",
          personId: 9,
        },
      },
    });
  });

  test("register throws ConflictError when username already exists", async () => {
    userRepository.findByUsername.mockResolvedValueOnce({ id: 1, username: "ada" });

    await expect(
      register(
        {
          body: {
            username: "ada",
            password: "password123",
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@example.com",
            personnummer: "199001011234",
          },
          requestId: "req-2",
        },
        makeRes()
      )
    ).rejects.toBeInstanceOf(ConflictError);
  });

  test("login signs a JWT for a valid account", async () => {
    userRepository.findByIdentifier.mockResolvedValueOnce({
      id: 7,
      person_id: 9,
      username: "ada",
      password_hash: "stored-hash",
      role: "recruiter",
      needs_password_reset: false,
      email: "ada@example.com",
    });

    const req = {
      body: {
        username: "ada",
        password: "password123",
      },
      requestId: "req-3",
    };
    const res = makeRes();

    await login(req, res);

    expect(verifyPassword).toHaveBeenCalledWith("password123", "stored-hash");
    expect(signJwt).toHaveBeenCalledWith({
      userId: 7,
      role: "recruiter",
      personId: 9,
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      data: {
        token: "jwt-token",
        role: "recruiter",
        needsPasswordReset: false,
      },
    });
  });

  test("login throws AuthError when password reset is required", async () => {
    userRepository.findByIdentifier.mockResolvedValueOnce({
      id: 7,
      person_id: 9,
      username: "ada",
      password_hash: "stored-hash",
      role: "applicant",
      needs_password_reset: true,
      email: "ada@example.com",
    });

    await expect(
      login(
        {
          body: { username: "ada", password: "password123" },
          requestId: "req-4",
        },
        makeRes()
      )
    ).rejects.toEqual(expect.objectContaining({ code: "AUTH_PASSWORD_RESET_REQUIRED" }));
  });

  test("requestRecovery returns generic success when no matching account exists", async () => {
    userRepository.findByIdentifier.mockResolvedValueOnce(null);
    const res = makeRes();

    await requestRecovery(
      {
        body: { identifier: "missing" },
        requestId: "req-5",
        headers: {},
        socket: { remoteAddress: "127.0.0.1" },
      },
      res
    );

    expect(sendRecoveryEmail).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "If an account exists, a recovery email has been sent",
      data: { accepted: true },
    });
  });

  test("requestRecovery creates a token and sends email for a matching user", async () => {
    userRepository.findByIdentifier.mockResolvedValueOnce({
      id: 7,
      person_id: 9,
      username: "ada",
      password_hash: "stored-hash",
      role: "applicant",
      needs_password_reset: false,
      email: "ada@example.com",
    });

    const res = makeRes();

    await requestRecovery(
      {
        body: { identifier: "ada" },
        requestId: "req-6",
        headers: { "user-agent": "jest" },
        socket: { remoteAddress: "127.0.0.1" },
      },
      res
    );

    expect(recoveryTokenRepository.create).toHaveBeenCalled();
    expect(sendRecoveryEmail).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "If an account exists, a recovery email has been sent",
      data: { accepted: true },
    });
  });

  test("confirmRecovery sets a new password and returns a JWT", async () => {
    const res = makeRes();

    await confirmRecovery(
      {
        body: {
          token: "12345678901234567890validtoken",
          newPassword: "new-password-123",
        },
        requestId: "req-7",
      },
      res
    );

    expect(hashPassword).toHaveBeenCalledWith("new-password-123");
    expect(recoveryTokenRepository.consumeActiveByTokenHash).toHaveBeenCalled();
    expect(userRepository.setPasswordAndClearResetFlag).toHaveBeenCalledWith(
      expect.any(Object),
      {
        userId: 7,
        passwordHash: "hashed-value",
      }
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Password updated",
      data: {
        token: "jwt-token",
        role: "applicant",
        needsPasswordReset: false,
      },
    });
  });

  test("confirmRecovery throws AuthError when token is invalid or expired", async () => {
    recoveryTokenRepository.consumeActiveByTokenHash.mockResolvedValueOnce(null);

    await expect(
      confirmRecovery(
        {
          body: {
            token: "12345678901234567890validtoken",
            newPassword: "new-password-123",
          },
          requestId: "req-8",
        },
        makeRes()
      )
    ).rejects.toBeInstanceOf(AuthError);
  });

  test("me returns current user with a null person when personId is missing", async () => {
    const res = makeRes();

    await me(
      {
        user: {
          userId: 7,
          role: "applicant",
          personId: null,
        },
      },
      res
    );

    expect(personRepository.getPersonDisplayById).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Current user",
      data: {
        user: {
          userId: 7,
          role: "applicant",
          personId: null,
        },
        person: null,
      },
    });
  });
});
