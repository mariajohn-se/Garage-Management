import { useEffect, useState } from 'react';
import { customerApi } from '../api/partyApi';
import { ApiError } from '../api/client';

interface VisitRow {
  custId: string;
  name: string;
  phone: string | null;
  fax: string | null;
  email: string | null;
  visitCount: number;
}

export function CustomerVisitReportPage() {
  const [rows, setRows] = useState<VisitRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    customerApi
      .visitSummary()
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load customer visit report.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows?.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <div className="section-card">
      <h2>Customer Visit Report</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Total bill/visit count per customer across the full transaction history, ranked highest first.
      </p>

      <div className="filter-bar">
        <input placeholder="Search name..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading &&
        Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-row" style={{ height: 32 }} />)}

      {rows && filtered.length === 0 && <div className="empty-state">No customers match this search.</div>}
      {rows && filtered.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Visits</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 500).map((r) => (
              <tr key={r.custId}>
                <td>{r.name}</td>
                <td>{r.phone ?? '—'}</td>
                <td>{r.email ?? '—'}</td>
                <td>{r.visitCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filtered.length > 500 && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
          Showing first 500 of {filtered.length} matching customers.
        </p>
      )}
    </div>
  );
}
