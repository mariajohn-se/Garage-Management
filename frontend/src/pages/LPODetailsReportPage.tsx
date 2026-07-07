import { useState } from 'react';
import { purchaseApi } from '../api/purchaseApi';
import { ApiError } from '../api/client';

interface Row {
  POrder: string;
  SuppName: string;
  DT: string;
  ItemCode: string;
  Description: string;
  Qty: number;
  Rate: number;
  Amount: number;
  RcvdQty: number;
}

export function LPODetailsReportPage() {
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows((await purchaseApi.lpoDetailsReport(fromDate, toDate)) as unknown as Row[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the LPO details report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>LPO Details Report</h2>
      <div className="filter-bar">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {rows && rows.length === 0 && <div className="empty-state">No data for this date range.</div>}
      {rows && rows.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>PO #</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Received</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((r, i) => (
                <tr key={i}>
                  <td>{r.POrder}</td>
                  <td>{r.SuppName}</td>
                  <td>{r.DT ? new Date(r.DT).toLocaleDateString() : '—'}</td>
                  <td>{r.Description ?? r.ItemCode}</td>
                  <td>{r.Qty}</td>
                  <td>{r.RcvdQty}</td>
                  <td>{r.Rate}</td>
                  <td>{r.Amount}</td>
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
