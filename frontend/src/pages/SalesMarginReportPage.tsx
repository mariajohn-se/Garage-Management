import { useState } from 'react';
import { salesApi } from '../api/salesApi';
import { ApiError } from '../api/client';

interface Row {
  bill: string;
  billDt: string;
  itemcode: string;
  description: string;
  custname: string;
  qty: number;
  rate: number;
  amount: number;
  purRate: number;
  nett: number;
}

export function SalesMarginReportPage() {
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows((await salesApi.salesMarginDetails(fromDate, toDate)) as unknown as Row[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the sales margin report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Sales Margin Details</h2>
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
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Sale Rate</th>
              <th>Purchase Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 500).map((r, i) => (
              <tr key={i}>
                <td>{r.bill}</td>
                <td>{r.billDt ? new Date(r.billDt).toLocaleDateString() : '—'}</td>
                <td>{r.custname}</td>
                <td>{r.description ?? r.itemcode}</td>
                <td>{r.qty}</td>
                <td>{r.rate}</td>
                <td>{r.purRate}</td>
                <td>{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rows && rows.length > 500 && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
          Showing first 500 of {rows.length} rows.
        </p>
      )}
    </div>
  );
}
