const { authenticate, authorize } = require("../../src/middleware/auth");
const { signJwt } = require("../../src/utils/jwt");
const { AuthError, ForbiddenError } = require("../../src/errors");

function makeReqResNext({ headers = {} } = {}) {
  const req = { headers };
  const res = {};
  const next = jest.fn();
  return { req, res, next };
}

describe("middleware/auth", () => {
  test("authenticate sets req.user for valid Bearer token", () => {
    const token = signJwt({ userId: 7, role: "recruiter", personId: 99 }, { expiresInSeconds: 60 });
    const { req, res, next } = makeReqResNext({
      headers: { authorization: `Bearer ${token}` },
    });

    authenticate()(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // no error
    expect(req.user).toEqual({ userId: 7, role: "recruiter", personId: 99 });
  });

  test("authenticate rejects missing Authorization header", () => {
    const { req, res, next } = makeReqResNext();
    authenticate()(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AuthError);
    expect(err.code).toBe("AUTH_REQUIRED");
    expect(err.status).toBe(401);
  });

  test("authorize rejects wrong role", () => {
    const { req, res, next } = makeReqResNext();
    req.user = { userId: 1, role: "applicant", personId: 2 };

    authorize("recruiter")(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.status).toBe(403);
  });
});
