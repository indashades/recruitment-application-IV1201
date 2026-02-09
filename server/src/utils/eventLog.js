/**
 * Writes a structured JSON event to stdout.
 *
 * @param {string} event
 * @param {Record<string, any>} [payload]
 * @returns {void}
 */
function eventLog(event, payload = {}) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    ...payload,
  };

  console.log(JSON.stringify(entry));
}

module.exports = { eventLog };
