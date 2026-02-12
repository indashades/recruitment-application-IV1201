const { eventLogRepository } = require("../repositories/eventLogRepository");

/**
 * Writes a structured JSON event to console and persists to DB.
 *
 * @param {string} event
 * @param {Record<string, any>} [payload]
 * @param {{ level?: "debug"|"info"|"warn"|"error", req?: import("express").Request, status?: number }} [opts]
 * @returns {void}
 */
function eventLog(event, payload = {}, opts = {}) {
  const level = opts.level || "info";

  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...payload,
  };

  console.log(JSON.stringify(entry));

  const req = opts.req;
  const actor = req && req.user;

  eventLogRepository
    .insert(null, {
      ts: entry.ts,
      level,
      event,
      requestId: payload.requestId || (req && req.requestId) || null,
      actorUserId: payload.actorUserId ?? (actor && actor.userId) ?? null,
      actorPersonId: payload.actorPersonId ?? (actor && actor.personId) ?? null,
      method: (req && req.method) || payload.method || null,
      path: (req && req.originalUrl) || payload.path || null,
      status: opts.status ?? payload.status ?? null,
      ip: (req && (req.headers["x-forwarded-for"] || req.socket?.remoteAddress)) || null,
      userAgent: (req && req.headers["user-agent"]) || null,
      payload,
    })
    .catch((e) => {
      console.error("Failed to persist event_log:", {
        message: e && e.message,
      });
    });
}

module.exports = { eventLog };
