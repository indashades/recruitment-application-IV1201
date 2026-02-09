/**
 * Catch-all middleware that forwards a standardized 404 error.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {void}
 */

function notFound(req, res, next) {
  const { NotFoundError } = require("../errors");
  next(
    new NotFoundError("Not Found", { path: req.originalUrl })
  );
}

module.exports = { notFound };