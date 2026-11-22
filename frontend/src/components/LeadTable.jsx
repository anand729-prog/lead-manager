import { useState } from "react";

export default function LeadTable({ leads, onEdit, onDelete, onStatusChange }) {
  const [confirmId, setConfirmId] = useState(null);

  if (!leads.length) {
    return <p className="empty">No leads found. Try clearing the search or filter — or add your first lead above.</p>;
  }

  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Company</th>
          <th>Source</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead._id}>
            <td>{lead.name}</td>
            <td>{lead.email}</td>
            <td>{lead.phone}</td>
            <td>{lead.company || "—"}</td>
            <td>{lead.source}</td>
            <td>
              <select
                className={`status-badge status-${lead.status.toLowerCase()}`}
                value={lead.status}
                onChange={(e) => onStatusChange(lead._id, e.target.value)}
                aria-label={`Status for ${lead.name}`}
              >
                {["New", "Contacted", "Qualified", "Lost"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </td>
            <td className="actions">
              <button className="btn small" onClick={() => onEdit(lead)}>Edit</button>
              {confirmId === lead._id ? (
                <>
                  <button className="btn small danger" onClick={() => onDelete(lead._id)}>Confirm delete</button>
                  <button className="btn small" onClick={() => setConfirmId(null)}>Keep</button>
                </>
              ) : (
                <button className="btn small danger-outline" onClick={() => setConfirmId(lead._id)}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
