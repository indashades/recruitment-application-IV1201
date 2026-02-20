const nodemailer = require("nodemailer");
const { getRecoveryTokenTtlMinutes } = require("../utils/recoveryToken");

// Cache (disabled in tests)
let transporter = null;
let transporterKey = null;

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function sanitizeUser(v) {
  return String(v || "").trim();
}

// Remove newlines and excessive whitespace from passwords to prevent config issues
function sanitizePass(v) {
  return String(v || "")
    .trim()
    .replace(/\r?\n/g, "")
    .replace(/\s+/g, "");
}

function readSmtpConfig() {
  const host = sanitizeUser(process.env.MAIL_HOST || "smtp.gmail.com");
  const port = Number(process.env.MAIL_PORT || 587);

  // Match working method: 587 => STARTTLS (secure=false)
  const secureDefault = port === 465;
  const secure = parseBoolean(process.env.MAIL_SECURE, secureDefault);

  const user = sanitizeUser(process.env.MAIL_USER);
  const pass = sanitizePass(process.env.MAIL_PASSWORD);

  if (!user || !pass) {
    throw new Error("MAIL_USER and MAIL_PASSWORD are not configured");
  }

  return { host, port, secure, user, pass };
}

function buildTransportOptions(cfg) {
  return {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure, // false on 587, true on 465
    auth: { user: cfg.user, pass: cfg.pass },

    // if STARTTLS isn’t available, fail instead of falling back to plaintext.
    requireTLS: !cfg.secure,

    // Probably useful? Some providers (e.g. Gmail) require this to avoid "cannot connect - handshake timeout" errors.
    tls: {
      servername: cfg.host,
    },
  };
}

function getTransporter() {
  const isTest = process.env.NODE_ENV === "test";
  const cfg = readSmtpConfig();

  const key = JSON.stringify({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    user: cfg.user,
  });

  if (!isTest && transporter && transporterKey === key) return transporter;

  const created = nodemailer.createTransport(buildTransportOptions(cfg));

  if (!isTest) {
    transporter = created;
    transporterKey = key;
  }

  return created;
}

function getFromAddress() {
  const fallbackMailbox = process.env.MAIL_USER || "no-reply@localhost";
  return process.env.MAIL_FROM || `Recruitment App <${fallbackMailbox}>`;
}

/**
 * Sends account recovery email (set-password / reset-password).
 *
 * @param {{to:string, recoveryLink:string, mode:"set_password"|"reset_password"}} input
 * @returns {Promise<void>}
 */
async function sendRecoveryEmail({ to, recoveryLink, mode }) {
  const smtp = getTransporter();

  // verifies SMTP auth/handshake once per process
  // Set MAIL_VERIFY=true
  if (String(process.env.MAIL_VERIFY || "").toLowerCase() === "true") {
    await smtp.verify();
  }

  const ttlMinutes = getRecoveryTokenTtlMinutes();
  const appName = process.env.APP_NAME || "Recruitment Application";

  const subject =
    mode === "set_password"
      ? `${appName}: set your password`
      : `${appName}: reset your password`;

  const lead =
    mode === "set_password"
      ? "Finish setting up your account by choosing a password."
      : "We received a request to reset your password.";

  const text = [
    lead,
    "",
    `Open this link to continue: ${recoveryLink}`,
    "",
    `This link expires in ${ttlMinutes} minutes.`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>${lead}</p>
    <p><a href="${recoveryLink}">Continue account recovery</a></p>
    <p>This link expires in ${ttlMinutes} minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const info = await smtp.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  if (!info || !info.messageId) {
    throw new Error("Email provider error");
  }
}

module.exports = { sendRecoveryEmail };