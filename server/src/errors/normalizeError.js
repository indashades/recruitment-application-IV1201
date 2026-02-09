const { AppError, ValidationError } = require("./index");

function isBadJsonError(err) {
  return (
    err &&
    (err.type === "entity.parse.failed" ||
      (err instanceof SyntaxError && err.status === 400))
  );
}

/**
 * Converts unknown thrown values to a normalized `AppError` instance.
 *
 * @param {unknown} err
 * @returns {AppError}
 */
function normalizeError(err) {
  if (isBadJsonError(err)) {
    const e = new ValidationError("Invalid JSON", { reason: "BAD_JSON" }, { status: 400 });
    e.code = "BAD_JSON";
    return e;
  }

  if (err instanceof AppError) return err;

  // Fallback for unexpected errors
  const unknown = new AppError("Internal Server Error", {
    status: 500,
    code: "INTERNAL_ERROR",
    expose: false,
    details: undefined,
    cause: err,
  });
  return unknown;
}

module.exports = { normalizeError };
