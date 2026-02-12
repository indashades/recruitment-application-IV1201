const { Resend } = require("resend");
const { getRecoveryTokenTtlMinutes } = require("../utils/recoveryToken");

let resendClient = null;

function getResendClient() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  resendClient = new Resend(apiKey);
  return resendClient;
}

function getFromAddress() {
  return process.env.MAIL_FROM || "Recruitment App <onboarding@resend.dev>";
}

/**
 * Sends account recovery email (set-password / reset-password).
 *
 * @param {{to:string, recoveryLink:string, mode:"set_password"|"reset_password"}} input
 * @returns {Promise<void>}
 */
async function sendRecoveryEmail({ to, recoveryLink, mode }) {
  const client = getResendClient();
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

  const result = await client.emails.send({
    from: getFromAddress(),
    to: [to],
    subject,
    text,
    html,
  });
  if (result && result.error) throw new Error(result.error.message || "Email provider error");
}

module.exports = { sendRecoveryEmail };