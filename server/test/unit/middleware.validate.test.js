const Joi = require("joi");
const { validate } = require("../../src/middleware/validate");
const { ValidationError } = require("../../src/errors");

function makeReqResNext({ body = {}, query = {}, params = {} } = {}) {
  const req = { body, query, params };
  const res = {};
  const next = jest.fn();
  return { req, res, next };
}

describe("middleware/validate", () => {
  test("converts types and strips unknown keys", () => {
    const schema = Joi.object({ age: Joi.number().integer().required() });
    const { req, res, next } = makeReqResNext({ body: { age: "42", extra: "drop-me" } });

    validate({ body: schema })(req, res, next);

    expect(next).toHaveBeenCalledWith(); // ok
    expect(req.body).toEqual({ age: 42 });
  });

  test("returns ValidationError with formatted details", () => {
    const schema = Joi.object({ age: Joi.number().integer().required() });
    const { req, res, next } = makeReqResNext({ body: { age: "nope" } });

    validate({ body: schema })(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.status).toBe(422);
    expect(err.details).toHaveProperty("issues");
    expect(err.details).toHaveProperty("fields");
    expect(err.details.fields).toContain("age");
  });
});
