const express = require("express");

/**
 * Competences router.
 * @type {import("express").Router}
 */
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");

const { listCompetences } = require("../controllers/competenceController");

router.get("/", asyncHandler(listCompetences));

module.exports = router;
