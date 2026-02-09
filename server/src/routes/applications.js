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

const listQuerySchema = Joi.object({
  sortKey: Joi.string().valid("submissionDate", "status", "fullName").default("submissionDate"),
  direction: Joi.string().valid("asc", "desc").default("desc"),
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
