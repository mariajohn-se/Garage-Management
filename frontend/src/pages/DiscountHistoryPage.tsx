import { useState } from 'react';
import { receiptsPaymentsApi, DiscountAuditRow } from '../api/receiptsPaymentsApi';
import { ApiError } from '../api/client';

export function DiscountHistoryPage() {
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<DiscountAuditRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows(await receiptsPaymentsApi.discountHistory(fromDate, toDate, 0));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load discount history.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Discount History Audit</h2>
      <div className="filter-bar">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {rows && rows.length === 0 && <div className="empty-state">No discounted bills for this date range.</div>}
      {rows && rows.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Invoice Amount</th>
                <th>Discount</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((r, i) => (
                <tr key={i}>
                  <td>{r.bill ?? '—'}</td>
                  <td>{r.billDate ? new Date(r.billDate).toLocaleDateString() : '—'}</td>
                  <td>{r.customerName ?? '—'}</td>
                  <td>{r.invoiceAmount ?? 0}</td>
                  <td>{r.discount ?? 0}</td>
                  <td>{r.net ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 500 && (
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
              Showing first 500 of {rows.length} rows.
            </p>
          )}
        </>
      )}
    </div>
  );
}
