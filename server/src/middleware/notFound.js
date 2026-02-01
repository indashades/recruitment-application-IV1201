function notFound(req, res, next) {
  const { NotFoundError } = require("../errors");
  next(
    new NotFoundError("Not Found", { path: req.originalUrl })
  );
}

module.exports = { notFound };