const express = require("express");
const Joi = require("joi");
const router = express.Router();

const { asyncHandler } = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const {
  submitApplication,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const submitSchema = Joi.object({
  competences: Joi.array()
    .items(
      Joi.object({
        competenceId: Joi.number().integer().positive().required(),
        yearsOfExperience: Joi.number().integer().min(0).max(80).required(),
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

const listQuerySchema = Joi.object({
  sortKey: Joi.string().valid("submissionDate", "status", "fullName").default("submissionDate"),
  direction: Joi.string().valid("asc", "desc").default("desc"),
});

const idParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const patchStatusSchema = Joi.object({
  status: Joi.string().trim().min(1).max(50).required(),
  version: Joi.number().integer().min(1).required(),
});

// Applicant submit
router.post(
  "/",
  authenticate(),
  authorize("applicant"),
  validate({ body: submitSchema }),
  asyncHandler(submitApplication)
);

// Recruiter list
router.get(
  "/",
  authenticate(),
  authorize("recruiter"),
  validate({ query: listQuerySchema }),
  asyncHandler(listApplications)
);

// Recruiter details
router.get(
  "/:id",
  authenticate(),
  authorize("recruiter"),
  validate({ params: idParamsSchema }),
  asyncHandler(getApplicationById)
);

// Recruiter status update
router.patch(
  "/:id/status",
  authenticate(),
  authorize("recruiter"),
  validate({ params: idParamsSchema, body: patchStatusSchema }),
  asyncHandler(updateApplicationStatus)
);

module.exports = router;
