const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(8).max(200).required(),
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email().required(),
  personnummer: Joi.string()
    .trim()
    .pattern(/^(\d{6}[-+]\d{4}|\d{8}[-+]\d{4}|\d{10}|\d{12})$/)
    .required(),
});

const submitApplicationSchema = Joi.object({
  competences: Joi.array()
    .items(
      Joi.object({
        competenceId: Joi.number().integer().positive().required(),
        yearsOfExperience: Joi.number().min(0).max(80).precision(2).required(),
      }).required()
    )
    .min(1)
    .required(),
  availability: Joi.array()
    .items(
      Joi.object({
        fromDate: Joi.date().iso().required(),
        toDate: Joi.date().iso().required(),
      })
        .custom((value, helpers) => {
          const from = new Date(value.fromDate);
          const to = new Date(value.toDate);
          if (from > to) return helpers.error("any.invalid");
          return value;
        }, "fromDate <= toDate")
        .messages({ "any.invalid": "\"fromDate\" must be <= \"toDate\"" })
        .required()
    )
    .min(1)
    .required(),
});

const patchStatusSchema = Joi.object({
  // Must match DB constraint: CHECK (status IN ('unhandled','accepted','rejected'))
  status: Joi.string().trim().valid("unhandled", "accepted", "rejected").required(),
  version: Joi.number().integer().min(1).required(),
});

module.exports = {
  registerSchema,
  submitApplicationSchema,
  patchStatusSchema,
};