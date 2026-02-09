const crypto = require("crypto");

/**
 * Creates middleware that propagates or generates `x-request-id`.
 *
 * @returns {import("express").RequestHandler}
 */
function requestId() {
  return (req, res, next) => {
    const incoming =
      req.headers["x-request-id"] || req.headers["x-correlation-id"];
    req.requestId = (incoming && String(incoming)) || crypto.randomUUID();
    res.setHeader("x-request-id", req.requestId);
    next();
  };
}

module.exports = { requestId };