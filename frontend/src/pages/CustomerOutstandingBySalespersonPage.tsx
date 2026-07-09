import { useState } from 'react';
import { receiptsPaymentsApi, CustomerOutstandingRow } from '../api/receiptsPaymentsApi';
import { ApiError } from '../api/client';

export function CustomerOutstandingBySalespersonPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<CustomerOutstandingRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows(await receiptsPaymentsApi.customerOutstandingBySalesperson(date));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Customer Outstanding by Salesperson</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Outstanding customer bills as of the selected date. Many historical bills have no salesperson recorded —
        shown as "—".
      </p>
      <div className="filter-bar">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {rows && rows.length === 0 && <div className="empty-state">No outstanding bills as of this date.</div>}
      {rows && rows.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Bill #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Phone</th>
              <th>Salesperson</th>
              <th>Age (days)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.accountName ?? '—'}</td>
                <td>{r.bill ?? '—'}</td>
                <td>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                <td>{r.amount ?? 0}</td>
                <td>{r.balance ?? 0}</td>
                <td>{r.phone ?? '—'}</td>
                <td>{r.salesMan ?? '—'}</td>
                <td>{r.ageInDays ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
