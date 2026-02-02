/**
 * Structured event logging (no sensitive data).
 * Intentionally separate from error logging.
 */
function eventLog(event, payload = {}) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    ...payload,
  };

  // NOTE: Do NOT log secrets (passwords, tokens, raw PII beyond what’s needed).
  // Keep payload minimal and business-relevant.
  console.log(JSON.stringify(entry));
}

module.exports = { eventLog };
