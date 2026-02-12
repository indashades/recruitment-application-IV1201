const express = require("express");
const Joi = require("joi");

/**
 * Logs router.
 * @type {import("express").Router}
 */
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");
const { listLogs } = require("../controllers/logsController");

const querySchema = Joi.object({
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  level: Joi.string().valid("debug", "info", "warn", "error"),
  event: Joi.string().max(200),
  requestId: Joi.string().max(200),
  actorUserId: Joi.number().integer().positive(),
  limit: Joi.number().integer().min(1).max(500).default(100),
  offset: Joi.number().integer().min(0).default(0),
});

router.get(
  "/",
  authenticate(),
  authorize("recruiter"),
  validate({ query: querySchema }),
  asyncHandler(listLogs)
);

module.exports = router;
