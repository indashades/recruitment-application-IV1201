const crypto = require("crypto");

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlJson(obj) {
  return base64url(JSON.stringify(obj));
}

function signHmacSha256(data, secret) {
  return base64url(crypto.createHmac("sha256", secret).update(data).digest());
}

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-secret";
}

function signJwt(payload, opts = {}) {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);
  const expiresInSeconds = opts.expiresInSeconds ?? 60 * 60 * 24;

  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const h = base64urlJson(header);
  const p = base64urlJson(body);
  const signingInput = `${h}.${p}`;
  const sig = signHmacSha256(signingInput, secret);
  return `${signingInput}.${sig}`;
}

function verifyJwt(token) {
  const secret = getJwtSecret();
  const parts = String(token).split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const [h, p, sig] = parts;
  const signingInput = `${h}.${p}`;
  const expected = signHmacSha256(signingInput, secret);

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Invalid signature");
  }

  const payloadJson = Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  const payload = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && now > payload.exp) {
    throw new Error("Token expired");
  }

  return payload;
}

module.exports = { signJwt, verifyJwt };
