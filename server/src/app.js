/**
 * @fileoverview
 * Express application setup.
 *
 * Configures middleware, CORS, routes, and global error handling
 * for API version 1.
 */

const express = require("express");
const cors = require("cors");

const apiV1Routes = require("./routes/apiV1");
const { notFound } = require("./middleware/notFound");
const { requestId } = require("./middleware/requestId");
const { errorHandler } = require("./middleware/errorHandler");

/**
 * Express application instance.
 * @type {import("express").Application}
 */
const app = express();

/**
 * CORS configuration options.
 *
 * @type {import("cors").CorsOptions}
 */
const corsOptions = {
  origin: "https://recruitment-application-iv1201-client.onrender.com",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

/**
 * Enable CORS with custom options.
 */
app.use(cors(corsOptions));

/**
 * Parse incoming JSON request bodies.
 */
app.use(express.json());

/**
 * Attach a unique request ID to each request.
 */
app.use(requestId());

/**
 * API v1 routes.
 */
app.use("/api/v1", apiV1Routes);

/**
 * Handle 404 (Not Found) errors.
 */
app.use(notFound);

/**
 * Global error-handling middleware.
 */
app.use(errorHandler);

/**
 * Export the configured Express app.
 * @module app
 */
module.exports = { app };
