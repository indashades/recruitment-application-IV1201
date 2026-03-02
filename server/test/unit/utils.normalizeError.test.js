const { AppError } = require("../../src/errors");
const { normalizeError } = require("../../src/errors/normalizeError");

describe("errors/normalizeError", () => {
  test("returns an AppError unchanged", () => {
    const err = new AppError("Already normalized", {
      status: 409,
      code: "CONFLICT",
      expose: true,
      details: { field: "username" },
    });

    expect(normalizeError(err)).toBe(err);
  });

  test("converts body-parser style JSON parse errors into BAD_JSON", () => {
    const err = new SyntaxError("Unexpected token");
    err.status = 400;

    const normalized = normalizeError(err);

    expect(normalized.status).toBe(400);
    expect(normalized.code).toBe("BAD_JSON");
    expect(normalized.message).toBe("Invalid JSON");
  });

  test("converts unknown errors into INTERNAL_ERROR", () => {
    const normalized = normalizeError(new Error("boom"));

    expect(normalized.status).toBe(500);
    expect(normalized.code).toBe("INTERNAL_ERROR");
    expect(normalized.message).toBe("Internal Server Error");
  });
});
