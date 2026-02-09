const crypto = require("crypto");

function scryptAsync(password, salt, opts) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, opts.keylen, opts, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });
}

function defaultScryptParams() {
  return {
    N: 16384,
    r: 8,
    p: 1,
    keylen: 64,
    maxmem: 32 * 1024 * 1024,
  };
}

/**
 * Hashes plaintext password with scrypt and encoded parameters.
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  const params = defaultScryptParams();
  const salt = crypto.randomBytes(16).toString("hex");
  const dk = await scryptAsync(password, salt, params);
  const hashHex = Buffer.from(dk).toString("hex");
  return `scrypt$${params.N}$${params.r}$${params.p}$${salt}$${hashHex}`;
}

/**
 * Verifies plaintext password against stored scrypt hash string.
 *
 * @param {string} password
 * @param {string} stored
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, stored) {
  try {
    const parts = String(stored).split("$");
    if (parts.length !== 6) return false;
    const [algo, N, r, p, salt, hashHex] = parts;
    if (algo !== "scrypt") return false;

    const params = {
      N: Number(N),
      r: Number(r),
      p: Number(p),
      keylen: Buffer.from(hashHex, "hex").length,
      maxmem: 32 * 1024 * 1024,
    };

    const dk = await scryptAsync(password, salt, params);
    const a = Buffer.from(hashHex, "hex");
    const b = Buffer.from(dk);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };
