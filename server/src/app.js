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
 * Enable CORS with no options.
 */
app.use(cors());

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
