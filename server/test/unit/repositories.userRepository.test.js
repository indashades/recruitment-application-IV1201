jest.mock("../../src/repositories/db", () => ({
  exec: jest.fn(),
}));

const { exec } = require("../../src/repositories/db");
const { userRepository } = require("../../src/repositories/userRepository");

describe("repositories/userRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createUserAccount returns the inserted row", async () => {
    exec.mockResolvedValueOnce({
      rows: [{ id: 1, person_id: 9, username: "ada", role: "applicant" }],
    });

    const row = await userRepository.createUserAccount(
      { query: jest.fn() },
      {
        personId: 9,
        username: "ada",
        passwordHash: "hash",
        role: "applicant",
      }
    );

    expect(exec).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringContaining("INSERT INTO user_account"),
      [9, "ada", "hash", "applicant"]
    );
    expect(row).toEqual({ id: 1, person_id: 9, username: "ada", role: "applicant" });
  });

  test("findByUsername returns null when no user matches", async () => {
    exec.mockResolvedValueOnce({ rows: [] });

    await expect(userRepository.findByUsername("missing")).resolves.toBeNull();
  });

  test("findByIdentifier returns the first matching row", async () => {
    exec.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          person_id: 9,
          username: "ada",
          password_hash: "hash",
          role: "applicant",
          needs_password_reset: false,
          email: "ada@example.com",
        },
      ],
    });

    const row = await userRepository.findByIdentifier("ada");

    expect(exec).toHaveBeenCalledWith(
      null,
      expect.stringContaining("WHERE ua.username = $1 OR LOWER(p.email) = LOWER($1)"),
      ["ada"]
    );
    expect(row).toEqual({
      id: 1,
      person_id: 9,
      username: "ada",
      password_hash: "hash",
      role: "applicant",
      needs_password_reset: false,
      email: "ada@example.com",
    });
  });

  test("setPasswordAndClearResetFlag returns the updated account", async () => {
    exec.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          person_id: 9,
          username: "ada",
          role: "applicant",
          needs_password_reset: false,
        },
      ],
    });

    const row = await userRepository.setPasswordAndClearResetFlag(
      { query: jest.fn() },
      {
        userId: 1,
        passwordHash: "hash-2",
      }
    );

    expect(exec).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringContaining("UPDATE user_account SET password_hash = $1"),
      ["hash-2", 1]
    );
    expect(row).toEqual({
      id: 1,
      person_id: 9,
      username: "ada",
      role: "applicant",
      needs_password_reset: false,
    });
  });
});
