require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lead-manager";

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 }) // fail fast with a clear message if MongoDB is not reachable
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    console.error("Start a local MongoDB, or set MONGO_URI in a .env file (see .env.example).");
    process.exit(1);
  });
