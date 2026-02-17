const express = require("express");
const Joi = require("joi");

/**
 * Authentication router.
 * @type {import("express").Router}
 */
const router = express.Router();

const { asyncHandler } = require("../utils/asyncHandler");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { register, login, me, requestRecovery, confirmRecovery } = require("../controllers/authController");

const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(8).max(200).required(),
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email().required(),
  personnummer: Joi.string().trim().pattern(/^(\d{6}[-+]\d{4}|\d{8}[-+]\d{4}|\d{10}|\d{12})$/).required(),
  role: Joi.string().valid("applicant", "recruiter").default("applicant"),
});

const recoveryRequestSchema = Joi.object({
  identifier: Joi.string().trim().min(1).max(320).required(),
});

const recoveryConfirmSchema = Joi.object({
  token: Joi.string().trim().min(20).max(1024).required(),
  newPassword: Joi.string().min(8).max(200).required(),
});

const loginSchema = Joi.object({
  identifier: Joi.string().trim().min(1),
  username: Joi.string().trim().min(1), // Backward compatibility only, "identifier" should be used going forward
  password: Joi.string().required(),
}).or("identifier", "username");

router.post("/register", validate({ body: registerSchema }), asyncHandler(register));
router.post("/login", validate({ body: loginSchema }), asyncHandler(login));
router.get("/me", authenticate(), asyncHandler(me));
router.post("/recovery/request", validate({ body: recoveryRequestSchema }), asyncHandler(requestRecovery));
router.post("/recovery/confirm", validate({ body: recoveryConfirmSchema }), asyncHandler(confirmRecovery));

module.exports = router;
