const { AppError } = require("../errors");

function errorHandler(err, req, res, next) {
  const requestId = req.requestId;

  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal Server Error";
  let details;

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.expose ? err.message : message;
    details = err.details;
  }

  const logPayload = {
    requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    message: err && err.message,
    stack: err && err.stack,
    details: details,
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
