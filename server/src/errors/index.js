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

class ValidationError extends AppError {
  constructor(message = "Validation failed", details) {
    super(message, {
      status: 400,
      code: "VALIDATION_ERROR",
      expose: true,
      details,
    });
  }
}

class AuthError extends AppError {
  constructor(message = "Authentication required") {
    super(message, { status: 401, code: "AUTH_REQUIRED", expose: true });
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, { status: 403, code: "FORBIDDEN", expose: true });
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not Found", details) {
    super(message, { status: 404, code: "NOT_FOUND", expose: true, details });
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict", details) {
    super(message, { status: 409, code: "CONFLICT", expose: true, details });
  }
}

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