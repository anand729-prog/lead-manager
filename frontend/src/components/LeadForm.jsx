import { useState } from "react";
import { SOURCES, STATUSES, validateLead } from "../api.js";

const EMPTY = { name: "", email: "", phone: "", company: "", source: "Website", status: "New" };

export default function LeadForm({ initial = EMPTY, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateLead(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await onSubmit(form);
    } catch (err) {
      // Backend field errors (e.g. duplicate email) shown under the field.
      if (err.fieldErrors) setErrors(err.fieldErrors);
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Name *
          <input value={form.name} onChange={set("name")} placeholder="Priya Sharma" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label>
          Email *
          <input type="email" value={form.email} onChange={set("email")} placeholder="priya@example.com" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Phone *
          <input value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </label>
        <label>
          Company
          <input value={form.company} onChange={set("company")} placeholder="ShopExample" />
          {errors.company && <span className="field-error">{errors.company}</span>}
        </label>
        <label>
          Source
          <select value={form.source} onChange={set("source")}>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={form.status} onChange={set("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? "Saving…" : initial._id ? "Save changes" : "Add lead"}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
