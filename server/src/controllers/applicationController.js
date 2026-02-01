const { query } = require("../utils/database");

const {
  ValidationError,
  DbError,
} = require("../errors");

async function createApplication(req, res) {
  try {
    const { person_id, application_id } = req.body;

    // Validate required fields
    if (!person_id || !application_id) {
      throw new ValidationError("person_id and application_id are required", {
        fields: ["person_id", "application_id"],
      });
    }

    // Insert into applications table
    const result = await query(
      "INSERT INTO application (person_id, status, submission_date) VALUES ($1, $2, $3) RETURNING *",
      [person_id, "submitted", new Date()]
    );

    res.status(201).json({
      message: "Application created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error && error.name === "ValidationError") throw error;
    throw new DbError("Failed to create application", { cause: error });
  }
}

async function getApplications(req, res) {
  try {
    const result = await query(
      "SELECT * FROM application ORDER BY submission_date DESC LIMIT 50"
    );

    res.json({
      message: "Applications retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    throw new DbError("Failed to fetch applications", { cause: error });
  }
}

module.exports = {
  createApplication,
  getApplications,
};
