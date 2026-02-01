const express = require("express");
const cors = require("cors");

const apiV1Routes = require("./routes/apiV1");
const { notFound } = require("./middleware/notFound");
const { requestId } = require("./middleware/requestId");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// minimal, dev-friendly middleware
app.use(cors());
app.use(express.json());
app.use(requestId());

// versioned API root
app.use("/api/v1", apiV1Routes);

// errors
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
