require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to Flex Pulse Server!");
});

// API Routes
app.use("/api", apiRoutes);

// Error Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
