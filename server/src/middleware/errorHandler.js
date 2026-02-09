const { normalizeError } = require("../errors/normalizeError");

/**
 * Express error middleware that normalizes errors and returns API-safe payloads.
 *
 * @param {unknown} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next (Unused, present to satisfy Express error middleware signature)
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  const requestId = req.requestId;
  const e = normalizeError(err);
  const status = e.status || 500;
  const code = e.code || "INTERNAL_ERROR";
  const message = e.expose ? e.message : "Internal Server Error";
  const details = e.details;

  const logPayload = {
    requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    message: err && err.message,
    stack: err && err.stack,
    details,

  };
  
  console.error(logPayload);

  const body = {
    error: {
      code,
      message,
    },
  };
  if (requestId) body.error.requestId = requestId;
    if (details && status < 500) body.error.details = details;

  res.status(status).json(body);
}

module.exports = { errorHandler };
