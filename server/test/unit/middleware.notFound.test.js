const { NotFoundError } = require("../../src/errors");
const { notFound } = require("../../src/middleware/notFound");

describe("middleware/notFound", () => {
  test("forwards a NotFoundError containing the original path", () => {
    const req = { originalUrl: "/api/v1/missing" };
    const res = {};
    const next = jest.fn();

    notFound(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.details).toEqual({ path: "/api/v1/missing" });
  });
});
