const { requestId } = require("../../src/middleware/requestId");

describe("middleware/requestId", () => {
  function makeReqResNext(headers = {}) {
    const req = { headers };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();
    return { req, res, next };
  }

  test("generates a request id when none is provided", () => {
    const { req, res, next } = makeReqResNext();

    requestId()(req, res, next);

    expect(typeof req.requestId).toBe("string");
    expect(req.requestId.length).toBeGreaterThan(10);
    expect(res.setHeader).toHaveBeenCalledWith("x-request-id", req.requestId);
    expect(next).toHaveBeenCalledWith();
  });

  test("reuses x-request-id when provided", () => {
    const { req, res, next } = makeReqResNext({ "x-request-id": "req-123" });

    requestId()(req, res, next);

    expect(req.requestId).toBe("req-123");
    expect(res.setHeader).toHaveBeenCalledWith("x-request-id", "req-123");
    expect(next).toHaveBeenCalledWith();
  });

  test("falls back to x-correlation-id when x-request-id is absent", () => {
    const { req, res, next } = makeReqResNext({ "x-correlation-id": "corr-456" });

    requestId()(req, res, next);

    expect(req.requestId).toBe("corr-456");
    expect(res.setHeader).toHaveBeenCalledWith("x-request-id", "corr-456");
    expect(next).toHaveBeenCalledWith();
  });
});
