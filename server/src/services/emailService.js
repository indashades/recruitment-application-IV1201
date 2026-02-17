const nodemailer = require("nodemailer");
const { getRecoveryTokenTtlMinutes } = require("../utils/recoveryToken");

let transporter = null;

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.MAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.MAIL_PORT || 587);
  const secure = parseBoolean(process.env.MAIL_SECURE, port === 465);

  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASSWORD;
  if (!user || !pass) {
    throw new Error("MAIL_USER and MAIL_PASSWORD are not configured");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
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
