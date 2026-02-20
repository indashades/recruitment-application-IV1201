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
 * Validates and returns normalized value, throws API ValidationError if invalid.
 *
 * @param {import("joi").Schema} schema
 * @param {any} value
 * @param {import("joi").ValidationOptions} [options]
 * @returns {any}
 */
function validateOrThrow(schema, value, options = {}) {
  const r = schema.validate(value, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
    ...options,
  });

  if (r.error) {
    throw new ValidationError("Validation failed", formatJoiError(r.error));
  }
  return r.value;
}

module.exports = { validateOrThrow };