/**
 * Base application error for API/domain failures.
 * @extends Error
 */
class AppError extends Error {  
    constructor(message, opts = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = opts.status || 500;
    this.code = opts.code || "INTERNAL_ERROR";
    this.expose = opts.expose ?? (this.status < 500);
    this.details = opts.details;
    if (opts.cause) this.cause = opts.cause;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Input/validation error.
 * @extends AppError
 */
class ValidationError extends AppError {
  constructor(message = "Validation failed", details, opts = {}) {
    super(message, {
      status: opts.status || 422,
      code: "VALIDATION_ERROR",
      expose: true,
      details,
    });
  }
}

/**
 * Authentication error.
 * @extends AppError
 */
class AuthError extends AppError {
  constructor(message = "Authentication required", opts = {}) {
    super(message, {
      status: 401,
      code: opts.code || "AUTH_REQUIRED",
      expose: true,
      details: opts.details,
    });
  }
}

/**
 * Authorization error.
 * @extends AppError
 */
class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, { status: 403, code: "FORBIDDEN", expose: true });
  }
}

/**
 * Resource-not-found error.
 * @extends AppError
 */
class NotFoundError extends AppError {
  constructor(message = "Not Found", details) {
    super(message, { status: 404, code: "NOT_FOUND", expose: true, details });
  }
}

/**
 * Conflict error, e.g. optimistic locking or duplicate state.
 * @extends AppError
 */
class ConflictError extends AppError {
  constructor(message = "Conflict", details) {
    super(message, { status: 409, code: "CONFLICT", expose: true, details });
  }
}

/**
 * Database-layer error wrapper.
 * @extends AppError
 */
class DbError extends AppError {
  constructor(message = "Database error", opts = {}) {
    super(message, {
      status: 500,
      code: "DB_ERROR",
      expose: false,
      details: undefined,
      cause: opts.cause,
    });
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DbError,
};