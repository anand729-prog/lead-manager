// All API calls in one place. In development Vite proxies /api to the
// backend on :5000; in production set VITE_API_URL to the deployed API.
const BASE = import.meta.env.VITE_API_URL || "";

async function handle(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || "Request failed");
    err.fieldErrors = body.errors || null;
    err.status = res.status;
    throw err;
  }
  return body;
}

export const api = {
  listLeads: (params) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/api/leads?${q}`).then(handle);
  },
  getStats: () => fetch(`${BASE}/api/leads/stats`).then(handle),
  createLead: (lead) =>
    fetch(`${BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    }).then(handle),
  updateLead: (id, lead) =>
    fetch(`${BASE}/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    }).then(handle),
  deleteLead: (id) => fetch(`${BASE}/api/leads/${id}`, { method: "DELETE" }).then(handle),
};

export const SOURCES = ["Website", "Referral", "Social Media", "Cold Call", "Advertisement", "Other"];
export const STATUSES = ["New", "Contacted", "Qualified", "Lost"];

// Same rules as the backend (backend/src/validation.js) — invalid input is
// stopped here first, and the backend re-checks it anyway.
export function validateLead(lead) {
  const errors = {};
  if (!lead.name?.trim()) errors.name = "Name is required.";
  if (!lead.email?.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) errors.email = "Enter a valid email address.";
  if (!lead.phone?.trim()) errors.phone = "Phone is required.";
  else if (!/^\+?[0-9][0-9\s\-()]{7,17}$/.test(lead.phone.trim())) errors.phone = "Enter a valid phone number.";
  return errors;
}
