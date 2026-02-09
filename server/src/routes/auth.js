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
const { register, login, me } = require("../controllers/authController");

const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(8).max(200).required(),
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email().required(),
  personnummer: Joi.string().trim().pattern(/^(\d{6}[-+]\d{4}|\d{8}[-+]\d{4}|\d{10}|\d{12})$/).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

router.post("/register", validate({ body: registerSchema }), asyncHandler(register));
router.post("/login", validate({ body: loginSchema }), asyncHandler(login));
router.get("/me", authenticate(), asyncHandler(me));

module.exports = router;
