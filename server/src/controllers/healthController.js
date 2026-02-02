const { query } = require("../utils/database");

async function healthController(req, res) {
  try {
    await query("SELECT 1");
    return res.json({
      message: "Health check",
      data: { status: "ok", db: "ok" },
    });
  } catch (err) {
    // Degraded signal: service is up but dependencies are not
    return res.status(503).json({
      message: "Health check",
      data: { status: "degraded", db: "down" },
    });
  }
}

module.exports = { healthController };
