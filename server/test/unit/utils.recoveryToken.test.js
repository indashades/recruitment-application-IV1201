const {
  generateRawRecoveryToken,
  hashRecoveryToken,
  getRecoveryTokenTtlMinutes,
  getRecoveryExpiresAt,
  buildRecoveryLink,
} = require("../../src/utils/recoveryToken");

describe("utils/recoveryToken", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("generateRawRecoveryToken returns a non-empty url-safe token", () => {
    const token = generateRawRecoveryToken();

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
    expect(token).not.toMatch(/[+/=]/);
  });

  test("hashRecoveryToken is deterministic for the same raw token", () => {
    const a = hashRecoveryToken("same-token");
    const b = hashRecoveryToken("same-token");
    const c = hashRecoveryToken("different-token");

    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  test("getRecoveryTokenTtlMinutes falls back to 30 when env is missing or too small", () => {
    delete process.env.RECOVERY_TOKEN_TTL_MINUTES;
    expect(getRecoveryTokenTtlMinutes()).toBe(30);

    process.env.RECOVERY_TOKEN_TTL_MINUTES = "3";
    expect(getRecoveryTokenTtlMinutes()).toBe(30);
  });

  test("getRecoveryTokenTtlMinutes clamps large values to 180", () => {
    process.env.RECOVERY_TOKEN_TTL_MINUTES = "999";
    expect(getRecoveryTokenTtlMinutes()).toBe(180);
  });

  test("getRecoveryExpiresAt adds the configured TTL to now", () => {
    process.env.RECOVERY_TOKEN_TTL_MINUTES = "45";
    const start = new Date("2026-03-02T10:00:00.000Z");

    const expiresAt = getRecoveryExpiresAt(start);

    expect(expiresAt.toISOString()).toBe("2026-03-02T10:45:00.000Z");
  });

  test("buildRecoveryLink uses APP_BASE_URL when configured", () => {
    process.env.APP_BASE_URL = "http://localhost:3001/";

    const url = buildRecoveryLink("abc123");

    expect(url).toBe("http://localhost:3001/#/__recover?token=abc123");
  });

  test("buildRecoveryLink falls back to localhost:5173 when no frontend URL is configured", () => {
    delete process.env.APP_BASE_URL;
    delete process.env.FRONTEND_URL;
    delete process.env.CLIENT_URL;

    const url = buildRecoveryLink("abc123");

    expect(url).toBe("http://localhost:5173/#/__recover?token=abc123");
  });
});
