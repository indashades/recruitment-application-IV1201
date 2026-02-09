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
const { registerSchema } = require("../validation/schemas");

const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

router.post("/register", validate({ body: registerSchema }), asyncHandler(register));
router.post("/login", validate({ body: loginSchema }), asyncHandler(login));
router.get("/me", authenticate(), asyncHandler(me));

module.exports = router;
