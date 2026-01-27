function healthController(req, res) {
  res.json({ status: "ok" });
}

module.exports = { healthController };
