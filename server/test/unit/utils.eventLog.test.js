jest.mock("../../src/repositories/eventLogRepository", () => ({
  eventLogRepository: {
    insert: jest.fn(),
  },
}));

const { eventLogRepository } = require("../../src/repositories/eventLogRepository");
const { eventLog } = require("../../src/utils/eventLog");

describe("utils/eventLog", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    eventLogRepository.insert.mockResolvedValue();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    eventLogRepository.insert.mockResolvedValue();
  });

  test("persists structured metadata and request context", async () => {
    const req = {
      requestId: "req-1",
      method: "POST",
      originalUrl: "/api/v1/auth/login",
      user: {
        userId: 7,
        role: "applicant",
        personId: 9,
      },
      headers: {
        "user-agent": "jest",
        "x-forwarded-for": "127.0.0.1",
      },
      socket: {
        remoteAddress: "::1",
      },
    };

    eventLog("login_attempt", { success: true }, { req, level: "info", status: 200 });
    await Promise.resolve();

    expect(eventLogRepository.insert).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        level: "info",
        event: "login_attempt",
        requestId: "req-1",
        actorUserId: 7,
        actorPersonId: 9,
        method: "POST",
        path: "/api/v1/auth/login",
        status: 200,
        ip: "127.0.0.1",
        userAgent: "jest",
        payload: { success: true },
      })
    );
  });

  test("does not throw when event log persistence fails", async () => {
    eventLogRepository.insert.mockRejectedValueOnce(new Error("insert failed"));

    expect(() => {
      eventLog("something_failed", { value: 1 });
    }).not.toThrow();

    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
