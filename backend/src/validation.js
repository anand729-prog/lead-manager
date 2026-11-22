// Shared validation for incoming lead data (backend side — the frontend
// mirrors the same rules so bad input is caught in both places).
const { LEAD_SOURCES, LEAD_STATUSES } = require("./models/Lead");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{7,17}$/;

function validateLead(body, { partial = false } = {}) {
  const errors = {};
  const isMissing = (v) => v === undefined || v === null || String(v).trim() === "";

  if (!partial || body.name !== undefined) {
    if (isMissing(body.name)) errors.name = "Name is required.";
    else if (String(body.name).trim().length > 100) errors.name = "Name must be 100 characters or fewer.";
  }
  if (!partial || body.email !== undefined) {
    if (isMissing(body.email)) errors.email = "Email is required.";
    else if (!EMAIL_RE.test(String(body.email).trim())) errors.email = "Enter a valid email address.";
  }
  if (!partial || body.phone !== undefined) {
    if (isMissing(body.phone)) errors.phone = "Phone is required.";
    else if (!PHONE_RE.test(String(body.phone).trim())) errors.phone = "Enter a valid phone number.";
  }
  if (body.company !== undefined && String(body.company).length > 100) {
    errors.company = "Company must be 100 characters or fewer.";
  }
  if (body.source !== undefined && !LEAD_SOURCES.includes(body.source)) {
    errors.source = `Source must be one of: ${LEAD_SOURCES.join(", ")}.`;
  }
  if (body.status !== undefined && !LEAD_STATUSES.includes(body.status)) {
    errors.status = `Status must be one of: ${LEAD_STATUSES.join(", ")}.`;
  }
  return errors;
}

module.exports = { validateLead, LEAD_SOURCES, LEAD_STATUSES };
