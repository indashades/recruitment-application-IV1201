const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");

const { listCompetences } = require("../controllers/competenceController");

router.get("/", asyncHandler(listCompetences));

module.exports = router;
