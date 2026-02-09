const { AuthError, ForbiddenError } = require("../errors");
const { verifyJwt } = require("../utils/jwt");

/**
 * Creates authentication middleware that validates Bearer JWT and sets `req.user`.
 *
 * @returns {import("express").RequestHandler}
 */
function authenticate() {
  return (req, res, next) => {
    const header = req.headers["authorization"];
    if (!header || typeof header !== "string") {
      return next(new AuthError("Authentication required", { code: "AUTH_REQUIRED" }));
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return next(new AuthError("Invalid authorization header", { code: "AUTH_INVALID" }));
    }

    try {
      const payload = verifyJwt(token);
      req.user = {
        userId: payload.userId,
        role: payload.role,
        personId: payload.personId,
      };
      return next();
    } catch (e) {
      return next(new AuthError("Invalid or expired token", { code: "AUTH_INVALID" }));
    }
  };
}

/**
 * Creates authorization middleware that enforces one required role.
 *
 * @param {string} requiredRole
 * @returns {import("express").RequestHandler}
 */
function authorize(requiredRole) {
  return (req, res, next) => {
    if (!req.user) return next(new AuthError("Authentication required", { code: "AUTH_REQUIRED" }));
    if (req.user.role !== requiredRole) return next(new ForbiddenError("Forbidden"));
    return next();
  };
}

module.exports = { authenticate, authorize };
