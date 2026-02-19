const { signJwt, verifyJwt } = require("../../src/utils/jwt");

describe("utils/jwt", () => {
  test("signJwt + verifyJwt roundtrip returns payload", () => {
    const token = signJwt({ userId: 1, role: "applicant", personId: 10 }, { expiresInSeconds: 60 });
    const payload = verifyJwt(token);

    expect(payload.userId).toBe(1);
    expect(payload.role).toBe("applicant");
    expect(payload.personId).toBe(10);
    expect(typeof payload.iat).toBe("number");
    expect(typeof payload.exp).toBe("number");
  });

  test("verifyJwt rejects expired token", () => {
    const token = signJwt({ userId: 1 }, { expiresInSeconds: -1 });
    expect(() => verifyJwt(token)).toThrow(/expired/i);
  });

  test("verifyJwt rejects tampered signature", () => {
    const token = signJwt({ userId: 1 }, { expiresInSeconds: 60 });
    const parts = token.split(".");
    parts[2] = parts[2].slice(0, -2) + "aa"; // corrupt signature
    const tampered = parts.join(".");

    expect(() => verifyJwt(tampered)).toThrow(/signature|invalid/i);
  });
});