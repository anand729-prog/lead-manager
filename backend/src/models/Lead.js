const mongoose = require("mongoose");

const LEAD_SOURCES = ["Website", "Referral", "Social Media", "Cold Call", "Advertisement", "Other"];
const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Lost"];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      // Allows +91 98765 43210, 09876543210, 98765-43210 etc. — digits, spaces, dashes, leading +
      match: [/^\+?[0-9][0-9\s\-()]{7,17}$/, "Please provide a valid phone number"],
    },
    company: { type: String, trim: true, default: "", maxlength: 100 },
    source: { type: String, enum: LEAD_SOURCES, default: "Website" },
    status: { type: String, enum: LEAD_STATUSES, default: "New", index: true },
  },
  { timestamps: true }
);

// Text index so search by name (and company) is fast and case-insensitive.
leadSchema.index({ name: "text", company: "text" });

module.exports = { Lead: mongoose.model("Lead", leadSchema), LEAD_SOURCES, LEAD_STATUSES };
