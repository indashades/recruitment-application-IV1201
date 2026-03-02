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

const { query } = require("../../src/utils/database");
const { app } = require("../../src/app");

describe("integration: /api/v1/health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /health returns 200 and ok when the database is reachable", async () => {
    query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }], rowCount: 1 });

    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Health check",
      data: { status: "ok", db: "ok" },
    });
  });

  test("GET /health returns 503 and degraded when the database query fails", async () => {
    query.mockRejectedValueOnce(new Error("db unavailable"));

    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      message: "Health check",
      data: { status: "degraded", db: "down" },
    });
  });
});
