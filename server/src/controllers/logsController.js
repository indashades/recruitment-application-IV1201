const { eventLogRepository } = require("../repositories/eventLogRepository");

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
