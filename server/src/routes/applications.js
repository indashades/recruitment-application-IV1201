const express = require("express");
const Joi = require("joi");

/**
 * Applications router.
 * @type {import("express").Router}
 */
const router = express.Router();

const { asyncHandler } = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const { submitApplicationSchema, patchStatusSchema } = require("../validation/schemas");

const {
  submitApplication,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const allowedStatuses = ["unhandled", "accepted", "rejected"];

const listQuerySchema = Joi.object({
  sortKey: Joi.string().valid("submissionDate", "status", "fullName").default("submissionDate"),
  direction: Joi.string().valid("asc", "desc").default("desc"),
  status: Joi.string().trim().valid(...allowedStatuses),
  q: Joi.string().trim().max(200).allow(""),
  fullName: Joi.string().trim().max(200).allow(""), // backward-compatible alias for q
  applicationId: Joi.number().integer().positive(),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
  limit: Joi.number().integer().min(1).max(500).default(50),
  offset: Joi.number().integer().min(0).default(0),
})
  .custom((value, helpers) => {
    if (value.fromDate && value.toDate && value.fromDate > value.toDate) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "fromDate <= toDate")
  .messages({
    "any.invalid": "\"fromDate\" must be <= \"toDate\"",
  });

const idParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// Applicant submit
router.post(
  "/",
  authenticate(),
  authorize("applicant"),
  validate({ body: submitApplicationSchema }),
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
