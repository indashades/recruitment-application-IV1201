const { ValidationError } = require("../errors");

function formatJoiError(error) {
  return {
    issues: error.details.map((d) => ({
      path: d.path.join("."),
      message: d.message,
      type: d.type,
    })),
    fields: Array.from(new Set(error.details.map((d) => d.path[0]).filter(Boolean))),
  };
}

/**
 * Validates payload with Joi and throws ValidationError on failure.
 * Used as a second validation gate at write boundary (pre-insert/pre-update).
 *
 * @template T
 * @param {import("joi").Schema} schema
 * @param {unknown} value
 * @returns {T}
 */
function assertValid(schema, value) {
  const r = schema.validate(value, { abortEarly: false, stripUnknown: true, convert: true });
  if (r.error) throw new ValidationError("Validation failed", formatJoiError(r.error));
  return r.value;
}

module.exports = {
  assertValid,
};