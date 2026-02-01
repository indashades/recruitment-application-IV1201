const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");


const { healthController } = require("../controllers/healthController");
const {
  createApplication,
  getApplications,
} = require("../controllers/applicationController");

router.get("/health", healthController);
router.post("/applications", asyncHandler(createApplication));
router.get("/applications", asyncHandler(getApplications));

module.exports = router;
