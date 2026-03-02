const { asyncHandler } = require("../../src/utils/asyncHandler");

describe("utils/asyncHandler", () => {
  test("passes through successful async handlers", async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    const fn = asyncHandler(async () => "ok");
    fn(req, res, next);

    await Promise.resolve();

    expect(next).not.toHaveBeenCalled();
  });

  test("forwards rejected promises to next", async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const err = new Error("boom");

    const fn = asyncHandler(async () => {
      throw err;
    });

    fn(req, res, next);

    await Promise.resolve();

    expect(next).toHaveBeenCalledWith(err);
  });
});
