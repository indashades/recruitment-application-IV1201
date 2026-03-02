jest.mock("../../src/utils/database", () => ({
  query: jest.fn(),
}));

const { query } = require("../../src/utils/database");
const { healthController } = require("../../src/controllers/healthController");

describe("controllers/healthController", () => {
  function makeRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns ok when SELECT 1 succeeds", async () => {
    query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }], rowCount: 1 });
    const res = makeRes();

    await healthController({}, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Health check",
      data: { status: "ok", db: "ok" },
    });
  });

  test("returns degraded when the database check fails", async () => {
    query.mockRejectedValueOnce(new Error("db down"));
    const res = makeRes();

    await healthController({}, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      message: "Health check",
      data: { status: "degraded", db: "down" },
    });
  });
});
