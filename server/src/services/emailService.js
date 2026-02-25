const { getRecoveryTokenTtlMinutes } = require("../utils/recoveryToken");

// MailerSend Email API (REST)
// Docs: POST /v1/email -> 202 Accepted + X-Message-Id header

function sanitize(v) {
  return String(v || "").trim();
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function parseMailbox(input) {
  const raw = sanitize(input);
  if (!raw) return null;

  // "Name <email@example.com>"
  const match = raw.match(/^\s*([^<>]+?)\s*<\s*([^<>@\s]+@[^<>@\s]+)\s*>\s*$/);
  if (match) {
    const name = sanitize(match[1]).replace(/^"|"$/g, "");
    const email = sanitize(match[2]).toLowerCase();
    return name ? { name, email } : { email };
  }

  // "email@example.com"
  if (raw.includes("@")) {
    return { email: raw.toLowerCase() };
  }

  return null;
}

function getFromAddress() {
  // Must be on a verified MailerSend domain
  const raw = process.env.MAIL_FROM || "";
  const parsed = parseMailbox(raw);

  if (!parsed || !parsed.email) {
    throw new Error(
      "MAIL_FROM must be configured for MailerSend (example: Recruitment App <no-reply@your-domain.com>)"
    );
  }

  return parsed;
}

function getReplyToAddress() {
  const raw = sanitize(process.env.MAILERSEND_REPLY_TO || "");
  if (!raw) return null;

  const parsed = parseMailbox(raw);
  if (!parsed || !parsed.email) {
    throw new Error(
      "MAILERSEND_REPLY_TO is invalid (example: support@your-domain.com or Support <support@your-domain.com>)"
    );
  }

  return parsed;
}

function readMailerSendConfig() {
  const apiKey = sanitize(process.env.MAILERSEND_API_KEY);
  if (!apiKey) {
    throw new Error("MAILERSEND_API_KEY is not configured");
  }

  const apiUrl = sanitize(process.env.MAILERSEND_API_URL || "https://api.mailersend.com/v1/email");
  const timeoutMsRaw = Number(process.env.MAILERSEND_TIMEOUT_MS || 10000);
  const timeoutMs = Number.isFinite(timeoutMsRaw)
    ? Math.min(Math.max(Math.floor(timeoutMsRaw), 1000), 60000)
    : 10000;

  const verifyTls = parseBoolean(process.env.MAILERSEND_VERIFY_TLS, true);

  return {
    apiKey,
    apiUrl,
    timeoutMs,
    verifyTls,
    from: getFromAddress(),
    replyTo: getReplyToAddress(),
  };
}

function getFetch() {
  if (typeof fetch === "function") return fetch;
  throw new Error(
    "Global fetch is not available. Use Node.js 18+ (recommended: Node 20 on Render)."
  );
}

async function postJson(url, body, headers, timeoutMs) {
  const f = getFetch();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await f(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let json = null;

    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // Some provider responses may be non-JSON
      }
    }

    return { res, text, json };
  } catch (err) {
    if (err && err.name === "AbortError") {
      throw new Error(`MailerSend request timed out after ${timeoutMs}ms`);
    }
    throw new Error(`MailerSend request failed: ${err && err.message ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

function summarizeMailerSendError(json, text) {
  if (!json) return sanitize(text) || "Unknown MailerSend error";

  // Common shapes:
  // { message: "...", errors: { field: ["msg"] } }
  // { message: "...", errors: [...] }
  const parts = [];

  if (json.message) parts.push(String(json.message));

  if (json.errors) {
    if (Array.isArray(json.errors)) {
      parts.push(json.errors.map((e) => JSON.stringify(e)).join("; "));
    } else if (typeof json.errors === "object") {
      const fieldParts = Object.entries(json.errors).map(([k, v]) => {
        if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
        return `${k}: ${String(v)}`;
      });
      parts.push(fieldParts.join("; "));
    } else {
      parts.push(String(json.errors));
    }
  }

  const msg = parts.filter(Boolean).join(" | ");
  return msg || sanitize(text) || "Unknown MailerSend error";
}

/**
 * Sends account recovery email (set-password / reset-password) via MailerSend.
 *
 * @param {{to:string, recoveryLink:string, mode:"set_password"|"reset_password"}} input
 * @returns {Promise<void>}
 */
async function sendRecoveryEmail({ to, recoveryLink, mode }) {
  const cfg = readMailerSendConfig();

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

  const payload = {
    from: cfg.from,
    to: [{ email: sanitize(to) }],
    subject,
    text,
    html,
  };

  if (cfg.replyTo) {
    payload.reply_to = cfg.replyTo;
  }

  const { res, text: responseText, json } = await postJson(
    cfg.apiUrl,
    payload,
    {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cfg.timeoutMs
  );

  // MailerSend docs specify 202 Accepted for a successful send request
  if (res.status !== 202) {
    const detail = summarizeMailerSendError(json, responseText);
    throw new Error(`MailerSend send failed (${res.status}): ${detail}`);
  }

  const messageId =
    (res.headers && typeof res.headers.get === "function" && res.headers.get("x-message-id")) ||
    (json && (json.message_id || json.messageId)) ||
    null;

  if (!messageId) {
    throw new Error("MailerSend accepted request but no message id was returned");
  }
}

module.exports = { sendRecoveryEmail };