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

describe("integration: /api/v1/competences", () => {
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

  test("GET /competences returns mapped competence rows", async () => {
    competenceRepository.listCompetences.mockResolvedValueOnce([
      { id: 1, code: "JAVA", name: "Java" },
      { id: 2, code: "JS", name: "JavaScript" },
    ]);

    const res = await request(app).get("/api/v1/competences");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Competences retrieved",
      data: [
        { id: 1, code: "JAVA", name: "Java" },
        { id: 2, code: "JS", name: "JavaScript" },
      ],
    });
  });

  test("GET /competences returns 500 through the shared error handler on repository failure", async () => {
    competenceRepository.listCompetences.mockRejectedValueOnce(new Error("database boom"));

    const res = await request(app).get("/api/v1/competences");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
    expect(res.body.error.message).toBe("Internal Server Error");
    expect(res.headers["x-request-id"]).toBeTruthy();
  });
});
