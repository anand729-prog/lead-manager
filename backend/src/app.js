const express = require("express");
const cors = require("cors");
const leadsRouter = require("./routes/leads");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/leads", leadsRouter);

// 404 for unknown API routes.
app.use("/api", (req, res) => res.status(404).json({ error: "Route not found." }));

// Central error handler: bad ids and validation errors become clean JSON.
app.use((err, req, res, next) => {
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid id." });
  if (err.name === "ValidationError") {
    const errors = {};
    for (const [key, value] of Object.entries(err.errors)) errors[key] = value.message;
    return res.status(400).json({ errors });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

module.exports = app;
