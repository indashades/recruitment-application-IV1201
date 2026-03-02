const request = require("supertest");

jest.mock("../../src/utils/eventLog", () => ({
  eventLog: jest.fn(),
}));

jest.mock("../../src/repositories/eventLogRepository", () => ({
  eventLogRepository: {
    list: jest.fn(),
    insert: jest.fn(),
  },
}));

const { eventLogRepository } = require("../../src/repositories/eventLogRepository");
const { signJwt } = require("../../src/utils/jwt");
const { app } = require("../../src/app");

describe("integration: /api/v1/logs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventLogRepository.list.mockResolvedValue([
      {
        id: 1,
        event: "login_attempt",
        level: "info",
        request_id: "req-1",
      },
    ]);
  });

  test("GET /logs allows recruiters and returns filtered rows", async () => {
    const token = signJwt({ userId: 2, role: "recruiter", personId: 20 }, { expiresInSeconds: 60 });

    const res = await request(app)
      .get("/api/v1/logs?level=info&limit=25&offset=5")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(eventLogRepository.list).toHaveBeenCalledWith({
      from: undefined,
      to: undefined,
      level: "info",
      event: undefined,
      requestId: undefined,
      actorUserId: undefined,
      limit: 25,
      offset: 5,
    });
    expect(res.body.data).toEqual([
      {
        id: 1,
        event: "login_attempt",
        level: "info",
        request_id: "req-1",
      },
    ]);
  });

  test("GET /logs rejects applicants with 403", async () => {
    const token = signJwt({ userId: 3, role: "applicant", personId: 30 }, { expiresInSeconds: 60 });

    const res = await request(app)
      .get("/api/v1/logs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  test("GET /logs rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/logs");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_REQUIRED");
  });

  test("GET /logs validates the query string and returns 422 for invalid params", async () => {
    const token = signJwt({ userId: 2, role: "recruiter", personId: 20 }, { expiresInSeconds: 60 });

    const res = await request(app)
      .get("/api/v1/logs?limit=9999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
