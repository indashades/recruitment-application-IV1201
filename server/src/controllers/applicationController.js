const { withTransaction } = require("../utils/database");
const { eventLog } = require("../utils/eventLog");

const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("../errors");

const { applicationRepository } = require("../repositories/applicationRepository");
const { competenceProfileRepository } = require("../repositories/competenceProfileRepository");
const { availabilityRepository } = require("../repositories/availabilityRepository");

/**
 * Applicant: POST /api/v1/applications
 * Payload: { competences: [{ competenceId, yearsOfExperience }], availability: [{ fromDate, toDate }] }
 * Auth: applicant
 */
async function submitApplication(req, res) {
  const actor = req.user;
  const { competences, availability } = req.body;

  if (!actor || !actor.personId) {
    throw new ValidationError("Authenticated user missing personId", {
      fields: ["personId"],
    });
  }

  const created = await withTransaction(async (client) => {
    const appRow = await applicationRepository.createApplication(client, {
      personId: actor.personId,
      status: "submitted",
      submissionDate: new Date(),
    });

    await competenceProfileRepository.bulkInsert(client, appRow.id, competences);
    await availabilityRepository.bulkInsert(client, appRow.id, availability);

    return appRow;
  });

  eventLog("application_submitted", {
    requestId: req.requestId,
    actorUserId: actor.userId,
    applicationId: created.id,
  });

  res.status(201).json({
    message: "Application submitted",
    data: {
      applicationId: created.id,
      status: created.status,
      submissionDate: created.submission_date,
      version: created.version,
    },
  });
}

/**
 * Recruiter: GET /api/v1/applications
 * Query: ?sortKey=submissionDate|status|fullName&direction=asc|desc
 * Auth: recruiter
 */
async function listApplications(req, res) {
  const { sortKey, direction } = req.query;
  const rows = await applicationRepository.listForRecruiter({
    sortKey,
    direction,
    limit: 50,
  });

  const data = rows.map((r) => ({
    applicationId: r.application_id,
    fullName: `${r.first_name} ${r.last_name}`.trim(),
    status: r.status,
    submissionDate: r.submission_date,
  }));

  res.json({ message: "Applications retrieved", data });
}

/**
 * Recruiter: GET /api/v1/applications/:id
 * Auth: recruiter
 */
async function getApplicationById(req, res) {
  const applicationId = Number(req.params.id);
  const details = await applicationRepository.getDetailsForRecruiter(applicationId);

  if (!details) {
    throw new NotFoundError("Application not found", { applicationId });
  }

  res.json({
    message: "Application retrieved",
    data: {
      applicationId: details.application.id,
      status: details.application.status,
      submissionDate: details.application.submission_date,
      version: details.application.version,
      person: {
        personId: details.person.id,
        firstName: details.person.first_name,
        lastName: details.person.last_name,
        email: details.person.email,
      },
      competences: details.competences.map((c) => ({
        competenceId: c.competence_id,
        code: c.code,
        name: c.name,
        yearsOfExperience: c.years_of_experience,
      })),
      availability: details.availability.map((a) => ({
        fromDate: a.from_date,
        toDate: a.to_date,
      })),
    },
  });
}

/**
 * Recruiter: PATCH /api/v1/applications/:id/status
 * Body: { status, version }
 * Auth: recruiter
 */
async function updateApplicationStatus(req, res) {
  const actor = req.user;
  const applicationId = Number(req.params.id);
  const { status, version } = req.body;

  const updated = await applicationRepository.updateStatusWithOptimisticLock({
    applicationId,
    status,
    version,
  });

  if (!updated) {
    throw new ConflictError("Application status update conflict", {
      applicationId,
      expectedVersion: version,
    });
  }

  eventLog("application_status_changed", {
    requestId: req.requestId,
    actorUserId: actor && actor.userId,
    applicationId,
    newStatus: status,
    newVersion: updated.version,
  });

  res.json({
    message: "Application status updated",
    data: {
      applicationId,
      status: updated.status,
      version: updated.version,
    },
  });
}

module.exports = {
  submitApplication,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
};
