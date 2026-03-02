jest.mock("../../src/repositories/eventLogRepository", () => ({
  eventLogRepository: {
    list: jest.fn(),
  },
}));

const { eventLogRepository } = require("../../src/repositories/eventLogRepository");
const { listLogs } = require("../../src/controllers/logsController");

describe("controllers/logsController", () => {
  function makeRes() {
    return {
      json: jest.fn(),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("passes parsed filters to the repository and returns rows", async () => {
    eventLogRepository.list.mockResolvedValueOnce([
      { id: 1, event: "account_created", level: "info" },
    ]);

    const req = {
      query: {
        from: "2026-03-01T00:00:00.000Z",
        to: "2026-03-02T00:00:00.000Z",
        level: "info",
        event: "account_created",
        requestId: "req-1",
        actorUserId: "7",
        limit: "50",
        offset: "10",
      },
    };
    const res = makeRes();

    await listLogs(req, res);

    expect(eventLogRepository.list).toHaveBeenCalledWith({
      from: "2026-03-01T00:00:00.000Z",
      to: "2026-03-02T00:00:00.000Z",
      level: "info",
      event: "account_created",
      requestId: "req-1",
      actorUserId: 7,
      limit: 50,
      offset: 10,
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Logs retrieved",
      data: [{ id: 1, event: "account_created", level: "info" }],
    });
  });
});
