import { useCallback, useEffect, useState } from "react";
import { api, STATUSES } from "./api.js";
import LeadForm from "./components/LeadForm.jsx";
import LeadTable from "./components/LeadTable.jsx";

export default function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, s] = await Promise.all([
        api.listLeads({ search, status: statusFilter, sort, limit: 100 }),
        api.getStats(),
      ]);
      setLeads(list.data);
      setTotal(list.total);
      setStats(s);
    } catch {
      setError("Could not reach the API. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sort]);

  useEffect(() => {
    const timer = setTimeout(load, 300); // debounce search typing
    return () => clearTimeout(timer);
  }, [load]);

  async function handleCreate(form) {
    setSaving(true);
    try {
      await api.createLead(form);
      setNotice("Lead added.");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(form) {
    setSaving(true);
    try {
      await api.updateLead(editing._id, form);
      setNotice("Lead updated.");
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteLead(id);
      setNotice("Lead deleted.");
      load();
    } catch {
      setError("Could not delete that lead. Please try again.");
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await api.updateLead(id, { status });
      setNotice("Status updated.");
      load();
    } catch {
      setError("Could not update the status. Please try again.");
    }
  }

  return (
    <main className="page">
      <header>
        <h1>Lead Manager</h1>
        <p>Capture and track sales leads — add, search, update status, delete.</p>
      </header>

      {stats && (
        <section className="stats" aria-label="Lead counts">
          <div className="stat"><strong>{stats.total}</strong><span>Total leads</span></div>
          {STATUSES.map((s) => (
            <div className="stat" key={s}>
              <strong>{stats.byStatus[s] ?? 0}</strong><span>{s}</span>
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2>{editing ? `Edit ${editing.name}` : "Add a lead"}</h2>
        <LeadForm
          key={editing?._id || "new"}
          initial={editing || undefined}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={editing ? () => setEditing(null) : null}
          saving={saving}
        />
      </section>

      {notice && <p className="notice" role="status">{notice}</p>}
      {error && <p className="error-banner" role="alert">{error}</p>}

      <section className="card">
        <div className="toolbar">
          <input
            type="search"
            placeholder="Search by name, company or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
          <span className="count">{total} lead{total === 1 ? "" : "s"}</span>
        </div>

        {loading ? (
          <p className="empty">Loading leads…</p>
        ) : (
          <div className="table-wrap">
            <LeadTable
              leads={leads}
              onEdit={setEditing}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </section>
    </main>
  );
}
