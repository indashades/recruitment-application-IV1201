jest.mock("../../src/utils/eventLog", () => ({
  eventLog: jest.fn(),
}));

const { ValidationError } = require("../../src/errors");
const { errorHandler } = require("../../src/middleware/errorHandler");

describe("middleware/errorHandler", () => {
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  function makeReqRes() {
    const req = {
      requestId: "req-1",
      method: "POST",
      originalUrl: "/api/v1/test",
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    return { req, res };
  }

  test("returns standardized JSON for exposed errors", () => {
    const { req, res } = makeReqRes();
    const err = new ValidationError("Validation failed", {
      fields: ["username"],
      issues: [{ path: "username", message: "\"username\" is required" }],
    });

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        requestId: "req-1",
        details: {
          fields: ["username"],
          issues: [{ path: "username", message: "\"username\" is required" }],
        },
      },
    });
  });

  test("hides internal error details for unexpected errors", () => {
    const { req, res } = makeReqRes();

    errorHandler(new Error("explode"), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal Server Error",
        requestId: "req-1",
      },
    });
  });
});
