const { eventLogRepository } = require("../repositories/eventLogRepository");

/**
 * Lists event logs using query-string filters and pagination.
 * Route: GET /api/v1/logs (auth: recruiter).
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>} Sends HTTP 200 with filtered log rows.
 */
async function listLogs(req, res) {
  const {
    from,
    to,
    level,
    event,
    requestId,
    actorUserId,
    limit,
    offset,
  } = req.query;

  const rows = await eventLogRepository.list({
    from,
    to,
    level,
    event,
    requestId,
    actorUserId: actorUserId ? Number(actorUserId) : undefined,
    limit: Number(limit),
    offset: Number(offset),
  });

  res.json({
    message: "Logs retrieved",
    data: rows,
  });
}

module.exports = { listLogs };
