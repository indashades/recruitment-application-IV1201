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

function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        const r = schemas.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });
        if (r.error) throw new ValidationError("Validation failed", formatJoiError(r.error));
        req.body = r.value;
      }
      if (schemas.params) {
        const r = schemas.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });
        if (r.error) throw new ValidationError("Validation failed", formatJoiError(r.error));
        req.params = r.value;
      }
      if (schemas.query) {
        const r = schemas.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });
        if (r.error) throw new ValidationError("Validation failed", formatJoiError(r.error));
        req.query = r.value;
      }
      return next();
    } catch (e) {
      return next(e);
    }
  };
}

module.exports = { validate };
