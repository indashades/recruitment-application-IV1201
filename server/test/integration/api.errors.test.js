const request = require("supertest");

jest.mock("../../src/utils/eventLog", () => ({
  eventLog: jest.fn(),
}));

jest.mock("../../src/repositories/competenceRepository", () => ({
  competenceRepository: {
    listCompetences: jest.fn(),
  },
}));

const { competenceRepository } = require("../../src/repositories/competenceRepository");
const { app } = require("../../src/app");

describe("integration: shared error handling", () => {
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("bad JSON body returns 400 BAD_JSON", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send('{"username":"broken"');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_JSON");
    expect(res.body.error.message).toBe("Invalid JSON");
  });

  test("unknown endpoint returns 404 NOT_FOUND", async () => {
    const res = await request(app)
      .get("/api/v1/definitely-missing")
      .set("x-request-id", "req-missing-1");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.requestId).toBe("req-missing-1");
    expect(res.headers["x-request-id"]).toBe("req-missing-1");
  });

  test("unexpected thrown errors return 500 INTERNAL_ERROR and preserve x-request-id", async () => {
    competenceRepository.listCompetences.mockRejectedValueOnce(new Error("unexpected db error"));

    const res = await request(app)
      .get("/api/v1/competences")
      .set("x-request-id", "req-500-1");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    expect(res.body.error.message).toBe("Internal Server Error");
    expect(res.body.error.requestId).toBe("req-500-1");
    expect(res.headers["x-request-id"]).toBe("req-500-1");
  });
});
