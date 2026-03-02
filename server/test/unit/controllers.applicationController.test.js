jest.mock("../../src/utils/database", () => ({
  withTransaction: jest.fn(),
}));

jest.mock("../../src/utils/eventLog", () => ({
  eventLog: jest.fn(),
}));

jest.mock("../../src/repositories/applicationRepository", () => ({
  applicationRepository: {
    createApplication: jest.fn(),
    listForRecruiter: jest.fn(),
    getDetailsForRecruiter: jest.fn(),
    updateStatusWithOptimisticLock: jest.fn(),
  },
}));

jest.mock("../../src/repositories/competenceProfileRepository", () => ({
  competenceProfileRepository: {
    bulkInsert: jest.fn(),
  },
}));

jest.mock("../../src/repositories/availabilityRepository", () => ({
  availabilityRepository: {
    bulkInsert: jest.fn(),
  },
}));

const { ValidationError, NotFoundError, ConflictError } = require("../../src/errors");
const { withTransaction } = require("../../src/utils/database");
const { applicationRepository } = require("../../src/repositories/applicationRepository");
const { competenceProfileRepository } = require("../../src/repositories/competenceProfileRepository");
const { availabilityRepository } = require("../../src/repositories/availabilityRepository");
const {
  submitApplication,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
} = require("../../src/controllers/applicationController");

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("controllers/applicationController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    withTransaction.mockImplementation(async (fn) => fn({ query: jest.fn(), release: jest.fn() }));
    applicationRepository.createApplication.mockResolvedValue({
      id: 123,
      person_id: 10,
      status: "unhandled",
      submission_date: "2026-03-02",
      version: 1,
    });
    competenceProfileRepository.bulkInsert.mockResolvedValue();
    availabilityRepository.bulkInsert.mockResolvedValue();
    applicationRepository.listForRecruiter.mockResolvedValue([
      {
        application_id: 123,
        first_name: "Ada",
        last_name: "Lovelace",
        status: "unhandled",
        submission_date: "2026-03-02",
      },
    ]);
    applicationRepository.getDetailsForRecruiter.mockResolvedValue({
      application: {
        id: 123,
        status: "unhandled",
        submission_date: "2026-03-02",
        version: 1,
      },
      person: {
        id: 10,
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
      },
      competences: [
        {
          competence_id: 1,
          code: "JAVA",
          name: "Java",
          years_of_experience: 4.5,
        },
      ],
      availability: [
        { from_date: "2026-04-01", to_date: "2026-04-30" },
      ],
    });
    applicationRepository.updateStatusWithOptimisticLock.mockResolvedValue({
      id: 123,
      status: "accepted",
      version: 2,
    });
  });

  test("submitApplication creates application, competences, and availability", async () => {
    const req = {
      user: { userId: 1, role: "applicant", personId: 10 },
      body: {
        competences: [{ competenceId: 1, yearsOfExperience: 4.5 }],
        availability: [{ fromDate: "2026-04-01", toDate: "2026-04-30" }],
      },
      requestId: "req-1",
    };
    const res = makeRes();

    await submitApplication(req, res);

    expect(applicationRepository.createApplication).toHaveBeenCalledWith(
      expect.any(Object),
      { personId: 10, status: "unhandled" }
    );
    expect(competenceProfileRepository.bulkInsert).toHaveBeenCalled();
    expect(availabilityRepository.bulkInsert).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Application submitted",
      data: {
        applicationId: 123,
        status: "unhandled",
        submissionDate: "2026-03-02",
        version: 1,
      },
    });
  });

  test("submitApplication throws ValidationError when authenticated user is missing personId", async () => {
    await expect(
      submitApplication(
        {
          user: { userId: 1, role: "applicant" },
          body: { competences: [], availability: [] },
        },
        makeRes()
      )
    ).rejects.toBeInstanceOf(ValidationError);
  });

  test("listApplications maps recruiter rows into API shape", async () => {
    const res = makeRes();

    await listApplications(
      {
        query: {
          sortKey: "submissionDate",
          direction: "desc",
          status: "unhandled",
          q: "",
          fullName: "Ada",
          applicationId: undefined,
          fromDate: undefined,
          toDate: undefined,
          limit: 50,
          offset: 0,
        },
      },
      res
    );

    expect(applicationRepository.listForRecruiter).toHaveBeenCalledWith({
      sortKey: "submissionDate",
      direction: "desc",
      status: "unhandled",
      q: "Ada",
      applicationId: undefined,
      fromDate: undefined,
      toDate: undefined,
      limit: 50,
      offset: 0,
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Applications retrieved",
      data: [
        {
          applicationId: 123,
          fullName: "Ada Lovelace",
          status: "unhandled",
          submissionDate: "2026-03-02",
        },
      ],
    });
  });

  test("getApplicationById returns detailed recruiter view", async () => {
    const res = makeRes();

    await getApplicationById(
      {
        params: { id: "123" },
      },
      res
    );

    expect(applicationRepository.getDetailsForRecruiter).toHaveBeenCalledWith(123);
    expect(res.json).toHaveBeenCalledWith({
      message: "Application retrieved",
      data: {
        applicationId: 123,
        status: "unhandled",
        submissionDate: "2026-03-02",
        version: 1,
        person: {
          personId: 10,
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
        },
        competences: [
          {
            competenceId: 1,
            code: "JAVA",
            name: "Java",
            yearsOfExperience: 4.5,
          },
        ],
        availability: [
          { fromDate: "2026-04-01", toDate: "2026-04-30" },
        ],
      },
    });
  });

  test("getApplicationById throws NotFoundError when no application exists", async () => {
    applicationRepository.getDetailsForRecruiter.mockResolvedValueOnce(null);

    await expect(
      getApplicationById(
        {
          params: { id: "999" },
        },
        makeRes()
      )
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  test("updateApplicationStatus returns the new status and version", async () => {
    const res = makeRes();

    await updateApplicationStatus(
      {
        user: { userId: 2, role: "recruiter", personId: 20 },
        params: { id: "123" },
        body: { status: "accepted", version: 1 },
        requestId: "req-2",
      },
      res
    );

    expect(applicationRepository.updateStatusWithOptimisticLock).toHaveBeenCalledWith({
      applicationId: 123,
      status: "accepted",
      version: 1,
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Application status updated",
      data: {
        applicationId: 123,
        status: "accepted",
        version: 2,
      },
    });
  });

  test("updateApplicationStatus throws ConflictError when optimistic lock fails", async () => {
    applicationRepository.updateStatusWithOptimisticLock.mockResolvedValueOnce(null);

    await expect(
      updateApplicationStatus(
        {
          user: { userId: 2, role: "recruiter", personId: 20 },
          params: { id: "123" },
          body: { status: "accepted", version: 5 },
          requestId: "req-3",
        },
        makeRes()
      )
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
