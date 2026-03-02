jest.mock("../../src/repositories/db", () => ({
  exec: jest.fn(),
}));

const { exec } = require("../../src/repositories/db");
const { recoveryTokenRepository } = require("../../src/repositories/recoveryTokenRepository");

describe("repositories/recoveryTokenRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("create inserts and returns token metadata", async () => {
    exec.mockResolvedValueOnce({
      rows: [
        {
          id: 101,
          user_id: 7,
          purpose: "reset_password",
          expires_at: "2026-03-02T12:00:00.000Z",
          used_at: null,
          created_at: "2026-03-02T11:00:00.000Z",
        },
      ],
    });

    const row = await recoveryTokenRepository.create(
      { query: jest.fn() },
      {
        userId: 7,
        tokenHash: "hash",
        purpose: "reset_password",
        expiresAt: new Date("2026-03-02T12:00:00.000Z"),
        requestIp: "127.0.0.1",
        requestUserAgent: "jest",
      }
    );

    expect(exec).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringContaining("INSERT INTO auth_recovery_token"),
      [
        7,
        "hash",
        "reset_password",
        new Date("2026-03-02T12:00:00.000Z"),
        "127.0.0.1",
        "jest",
      ]
    );
    expect(row).toEqual({
      id: 101,
      user_id: 7,
      purpose: "reset_password",
      expires_at: "2026-03-02T12:00:00.000Z",
      used_at: null,
      created_at: "2026-03-02T11:00:00.000Z",
    });
  });

  test("consumeActiveByTokenHash returns null when token is missing or expired", async () => {
    exec.mockResolvedValueOnce({ rows: [] });

    await expect(
      recoveryTokenRepository.consumeActiveByTokenHash({ query: jest.fn() }, "hash")
    ).resolves.toBeNull();
  });

  test("invalidateActiveTokensForUser excludes one token id when requested", async () => {
    exec.mockResolvedValueOnce({ rows: [], rowCount: 2 });

    await recoveryTokenRepository.invalidateActiveTokensForUser(
      { query: jest.fn() },
      7,
      { excludeId: 101 }
    );

    expect(exec).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringContaining("AND id <> $2"),
      [7, 101]
    );
  });

  test("invalidateActiveTokensForUser invalidates all tokens when excludeId is absent", async () => {
    exec.mockResolvedValueOnce({ rows: [], rowCount: 3 });

    await recoveryTokenRepository.invalidateActiveTokensForUser(
      { query: jest.fn() },
      7
    );

    expect(exec).toHaveBeenCalledWith(
      expect.any(Object),
      expect.not.stringContaining("AND id <> $2"),
      [7]
    );
  });
});
