const { hashPassword, verifyPassword } = require("../../src/utils/password");

describe("utils/password", () => {
  test("hashPassword returns scrypt-encoded string and verifyPassword succeeds", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);

    await expect(verifyPassword("correct horse battery staple", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  test("verifyPassword returns false on malformed stored hash", async () => {
    await expect(verifyPassword("pw", "not-a-real-hash")).resolves.toBe(false);
  });
});