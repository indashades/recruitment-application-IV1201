const express = require("express");

/**
 * Main API v1 router.
 * @type {import("express").Router}
 */
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");

const authRoutes = require("./auth");
const applicationsRoutes = require("./applications");
const competencesRoutes = require("./competences");

const { healthController } = require("../controllers/healthController");

router.get("/health", asyncHandler(healthController));

router.use("/auth", authRoutes);
router.use("/applications", applicationsRoutes);
router.use("/competences", competencesRoutes);

module.exports = router;
