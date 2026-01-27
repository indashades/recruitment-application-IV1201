function notFound(req, res, next) {
  res.status(404).json({ error: { message: "Not Found" } });
}

module.exports = { notFound };
