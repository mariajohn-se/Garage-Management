import { useState } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import { ApiError } from '../api/client';

interface Row {
  Type: string;
  ItemType: string;
  ItemCode: string;
  Tag: string | null;
  Description: string;
  Location: string | null;
  StockIN: number;
  StockOUT: number;
  Balance: number;
  COST: number;
}

export function StockValuationReportPage() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'0' | '1'>('0');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows((await inventoryApi.stockValuation(asOfDate, type)) as unknown as Row[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the stock valuation report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Stock Valuation Report</h2>
      <div className="filter-bar">
        <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value as '0' | '1')}>
          <option value="0">Type 0</option>
          <option value="1">Type 1</option>
        </select>
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {rows && rows.length === 0 && <div className="empty-state">No data as of this date.</div>}
      {rows && rows.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Item Type</th>
                <th>Location</th>
                <th>In</th>
                <th>Out</th>
                <th>Balance</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((r, i) => (
                <tr key={i}>
                  <td>{r.ItemCode}</td>
                  <td>{r.Description ?? '—'}</td>
                  <td>{r.ItemType ?? '—'}</td>
                  <td>{r.Location ?? '—'}</td>
                  <td>{r.StockIN}</td>
                  <td>{r.StockOUT}</td>
                  <td>{r.Balance}</td>
                  <td>{r.COST}</td>
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
