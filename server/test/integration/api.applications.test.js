const request = require("supertest");

jest.mock("../../src/utils/eventLog", () => ({
  eventLog: jest.fn(),
}));

jest.mock("../../src/utils/database", () => ({
  withTransaction: jest.fn(),
  query: jest.fn(),
  getClient: jest.fn(),
  pool: { query: jest.fn(), connect: jest.fn() },
}));

const { withTransaction, query } = require("../../src/utils/database");
const { signJwt } = require("../../src/utils/jwt");
const { app } = require("../../src/app");

describe("integration: /api/v1/applications", () => {

  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    withTransaction.mockReset();
    query.mockReset();
  });

  test("POST /applications (applicant) runs through route+middleware+controller+repositories and returns 201", async () => {
    const applicantToken = signJwt({ userId: 1, role: "applicant", personId: 10 }, { expiresInSeconds: 60 });

    const fakeClient = {
      query: jest.fn(async (sql, params) => {
        if (String(sql).includes("INSERT INTO application")) {
          return {
            rows: [{ id: 123, person_id: 10, status: "unhandled", submission_date: "2026-02-18", version: 1 }],
            rowCount: 1,
          };
        }
        return { rows: [], rowCount: 1 };
      }),
      release: jest.fn(),
    };

    withTransaction.mockImplementation(async (fn) => fn(fakeClient));

    const res = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${applicantToken}`)
      .set("x-request-id", "req-test-1")
      .send({
        competences: [{ competenceId: 1, yearsOfExperience: 2.5 }],
        availability: [{ fromDate: "2026-03-01", toDate: "2026-03-10" }],
      });

    expect(res.status).toBe(201);
    expect(res.headers["x-request-id"]).toBe("req-test-1");

    expect(res.body).toEqual({
      message: "Application submitted",
      data: {
        applicationId: 123,
        status: "unhandled",
        submissionDate: "2026-02-18",
        version: 1,
      },
    });

    expect(fakeClient.query).toHaveBeenCalled();
    const calls = fakeClient.query.mock.calls.map(([sql]) => String(sql));
    expect(calls.some((s) => s.includes("INSERT INTO application"))).toBe(true);
    expect(calls.some((s) => s.includes("INSERT INTO competence_profile"))).toBe(true);
    expect(calls.some((s) => s.includes("INSERT INTO availability"))).toBe(true);
  });

  test("POST /applications rejects invalid body (validate middleware + errorHandler)", async () => {
    const applicantToken = signJwt({ userId: 1, role: "applicant", personId: 10 }, { expiresInSeconds: 60 });

    const res = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${applicantToken}`)
      .send({
        competences: [{ competenceId: 1, yearsOfExperience: 2.5 }],
        availability: [{ fromDate: "2026-03-10", toDate: "2026-03-01" }], // invalid: from > to
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Validation failed");
    expect(res.body.error.details.fields).toContain("availability");
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  test("PATCH /applications/:id/status returns 409 on optimistic lock conflict (controller+repo+db adapter)", async () => {
    const recruiterToken = signJwt({ userId: 2, role: "recruiter", personId: 20 }, { expiresInSeconds: 60 });

    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .patch("/api/v1/applications/123/status")
      .set("Authorization", `Bearer ${recruiterToken}`)
      .send({ status: "accepted", version: 999 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(res.body.error.message).toMatch(/conflict/i);
  });

  test("GET unknown endpoint returns 404 via notFound + errorHandler", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  test("GET /applications without auth returns 401 via auth middleware + errorHandler", async () => {
    const res = await request(app).get("/api/v1/applications");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_REQUIRED");
  });
});
