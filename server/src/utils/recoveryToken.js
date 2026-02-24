const crypto = require("crypto");

/**
 * Generates a URL-safe raw recovery token.
 *
 * @param {number} [byteLength]
 * @returns {string}
 */
function generateRawRecoveryToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("base64url");
}

/**
 * Hashes raw token for secure storage/comparison.
 *
 * @param {string} token
 * @returns {string}
 */
function hashRecoveryToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

/**
 * Reads token TTL from env (minutes), with safe defaults.
 *
 * @returns {number}
 */
function getRecoveryTokenTtlMinutes() {
  const raw = Number(process.env.RECOVERY_TOKEN_TTL_MINUTES || 30);
  if (!Number.isFinite(raw)) return 30;
  const asInt = Math.floor(raw);
  if (asInt < 5) return 30;
  if (asInt > 180) return 180;
  return asInt;
}

/**
 * Computes expiration timestamp.
 *
 * @param {Date} [now]
 * @returns {Date}
 */
function getRecoveryExpiresAt(now = new Date()) {
  const ttlMs = getRecoveryTokenTtlMinutes() * 60 * 1000;
  return new Date(now.getTime() + ttlMs);
}

function getAppBaseUrl() {
  const raw = process.env.APP_BASE_URL || process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
  return raw.replace(/\/+$/, "");
}

function buildRecoveryLink(rawToken) {
  const base = getAppBaseUrl();
  const qs = new URLSearchParams({ token: rawToken }).toString();
  return `${base}/#/__recover?${qs}`;
}

module.exports = { generateRawRecoveryToken, hashRecoveryToken, getRecoveryTokenTtlMinutes, getRecoveryExpiresAt, buildRecoveryLink };