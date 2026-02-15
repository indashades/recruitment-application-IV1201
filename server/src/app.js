const express = require("express");
const cors = require("cors");

const apiV1Routes = require("./routes/apiV1");
const { notFound } = require("./middleware/notFound");
const { requestId } = require("./middleware/requestId");
const { errorHandler } = require("./middleware/errorHandler");

/**
 * Express application instance.
 * @type {import("express").Express}
 */
const app = express();

/**
 * Fallback CORS allowlist used when `CORS_ORIGINS` is not set.
 * @type {string[]}
 */
const defaultAllowedOrigins = [
  "https://recruitment-application-iv1201-client.onrender.com",
  "http://localhost:3001",
];

/**
 * Allowed CORS origins derived from process.env.CORS_ORIGINS or from {@link defaultAllowedOrigins}.
 *
 * @type {Set<string>}
 */
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || defaultAllowedOrigins.join(","))
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

app.use(
  cors({
    /**
     * CORS origin validation callback.
     *
     * - Allows requests with no Origin header (curl).
     * - Allows browser requests only if origin is included in allowedOrigins.
     *
     * @param {string | undefined} origin - Request Origin header value.
     * @param {(err: Error | null, allow?: boolean) => void} callback - CORS decision callback.
     * @returns {void}
     */
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      return callback(null, allowedOrigins.has(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id", "x-correlation-id"],
    exposedHeaders: ["x-request-id"],
    maxAge: 60 * 60 * 24,
  })
);

app.use(express.json());
app.use(requestId());

app.use("/api/v1", apiV1Routes);

app.use(notFound);
app.use(errorHandler);

/**
 * Exported Express app for server bootstrap.
 */
module.exports = { app };
