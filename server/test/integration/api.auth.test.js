const request = require("supertest");

jest.mock("../../src/utils/eventLog", () => ({
  eventLog: jest.fn(),
}));

jest.mock("../../src/utils/database", () => ({
  withTransaction: jest.fn(),
  query: jest.fn(),
  getClient: jest.fn(),
  pool: { query: jest.fn(), connect: jest.fn() },
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

jest.mock("../../src/utils/password", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

const { withTransaction } = require("../../src/utils/database");
const { userRepository } = require("../../src/repositories/userRepository");
const { personRepository } = require("../../src/repositories/personRepository");
const { recoveryTokenRepository } = require("../../src/repositories/recoveryTokenRepository");
const { sendRecoveryEmail } = require("../../src/services/emailService");
const { hashPassword, verifyPassword } = require("../../src/utils/password");
const { signJwt } = require("../../src/utils/jwt");
const { app } = require("../../src/app");

describe("integration: /api/v1/auth", () => {
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    withTransaction.mockImplementation(async (fn) => fn({ query: jest.fn(), release: jest.fn() }));

    hashPassword.mockResolvedValue("hashed-password");
    verifyPassword.mockResolvedValue(true);

    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.createUserAccount.mockResolvedValue({
      id: 11,
      person_id: 21,
      username: "newuser",
      role: "applicant",
    });
    userRepository.findByIdentifier.mockResolvedValue(null);
    userRepository.setPasswordAndClearResetFlag.mockResolvedValue({
      id: 11,
      person_id: 21,
      username: "newuser",
      role: "applicant",
      needs_password_reset: false,
    });

    personRepository.createPerson.mockResolvedValue({
      id: 21,
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
    });
    personRepository.getPersonDisplayById.mockResolvedValue({
      id: 21,
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
    });

    recoveryTokenRepository.create.mockResolvedValue({
      id: 900,
      user_id: 11,
      purpose: "reset_password",
      expires_at: "2026-03-02T12:00:00.000Z",
      used_at: null,
      created_at: "2026-03-02T11:30:00.000Z",
    });
    recoveryTokenRepository.consumeActiveByTokenHash.mockResolvedValue({
      id: 900,
      user_id: 11,
      purpose: "reset_password",
      expires_at: "2026-03-02T12:00:00.000Z",
      created_at: "2026-03-02T11:30:00.000Z",
    });
    recoveryTokenRepository.invalidateActiveTokensForUser.mockResolvedValue();

    sendRecoveryEmail.mockResolvedValue();
  });

  test("POST /auth/register returns 201 for a valid applicant registration", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        username: "newuser",
        password: "password123",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        personnummer: "199001011234",
      });

    expect(res.status).toBe(201);
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(personRepository.createPerson).toHaveBeenCalled();
    expect(userRepository.createUserAccount).toHaveBeenCalled();
    expect(res.body.data.user).toEqual({
      userId: 11,
      username: "newuser",
      role: "applicant",
      personId: 21,
    });
  });

  test("POST /auth/register returns 409 when username already exists", async () => {
    userRepository.findByUsername.mockResolvedValueOnce({ id: 1, username: "newuser" });

    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        username: "newuser",
        password: "password123",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        personnummer: "199001011234",
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  test("POST /auth/register returns 422 for invalid body", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        username: "ab",
        password: "short",
        firstName: "",
        lastName: "",
        email: "not-an-email",
        personnummer: "bad",
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /auth/login returns token and role for valid credentials", async () => {
    userRepository.findByIdentifier.mockResolvedValueOnce({
      id: 11,
      person_id: 21,
      username: "newuser",
      password_hash: "stored-hash",
      role: "applicant",
      needs_password_reset: false,
      email: "ada@example.com",
    });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        username: "newuser",
        password: "password123",
      });

    expect(res.status).toBe(200);
    expect(verifyPassword).toHaveBeenCalledWith("password123", "stored-hash");
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.role).toBe("applicant");
  });

  test("POST /auth/login returns 401 for invalid credentials", async () => {
    userRepository.findByIdentifier.mockResolvedValueOnce({
      id: 11,
      person_id: 21,
      username: "newuser",
      password_hash: "stored-hash",
      role: "applicant",
      needs_password_reset: false,
      email: "ada@example.com",
    });
    verifyPassword.mockResolvedValueOnce(false);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        username: "newuser",
        password: "wrong-password",
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_INVALID");
  });

  test("POST /auth/login returns 401 when password reset is required", async () => {
    userRepository.findByIdentifier.mockResolvedValueOnce({
      id: 11,
      person_id: 21,
      username: "newuser",
      password_hash: "stored-hash",
      role: "applicant",
      needs_password_reset: true,
      email: "ada@example.com",
    });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        username: "newuser",
        password: "password123",
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_PASSWORD_RESET_REQUIRED");
  });

  test("GET /auth/me returns authenticated user context", async () => {
    const token = signJwt({ userId: 11, role: "applicant", personId: 21 }, { expiresInSeconds: 60 });

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(personRepository.getPersonDisplayById).toHaveBeenCalledWith(21);
    expect(res.body.data.user).toEqual({
      userId: 11,
      role: "applicant",
      personId: 21,
    });
    expect(res.body.data.person).toEqual({
      personId: 21,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });
  });

  test("GET /auth/me returns 401 without a bearer token", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_REQUIRED");
  });

  test("POST /auth/recovery/request returns generic success even when account is unknown", async () => {
    userRepository.findByIdentifier.mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/v1/auth/recovery/request")
      .send({ identifier: "missing-user" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "If an account exists, a recovery email has been sent",
      data: { accepted: true },
    });
    expect(sendRecoveryEmail).not.toHaveBeenCalled();
  });

  test("POST /auth/recovery/confirm returns token for a valid recovery token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/recovery/confirm")
      .send({
        token: "12345678901234567890validtoken",
        newPassword: "new-password-123",
      });

    expect(res.status).toBe(200);
    expect(hashPassword).toHaveBeenCalledWith("new-password-123");
    expect(recoveryTokenRepository.consumeActiveByTokenHash).toHaveBeenCalled();
    expect(userRepository.setPasswordAndClearResetFlag).toHaveBeenCalled();
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.role).toBe("applicant");
  });

  test("POST /auth/recovery/confirm returns 401 for an invalid or expired token", async () => {
    recoveryTokenRepository.consumeActiveByTokenHash.mockResolvedValueOnce(null);

    const res = await request(app)
      .post("/api/v1/auth/recovery/confirm")
      .send({
        token: "12345678901234567890validtoken",
        newPassword: "new-password-123",
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_RECOVERY_TOKEN_INVALID");
  });
});
