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
  LastTranDate: string | null;
  Days: number;
}

export function StockAgingReportPage() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState('30');
  const [type, setType] = useState<'0' | '1'>('0');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows((await inventoryApi.stockAging(asOfDate, Number(days) || 30, type)) as unknown as Row[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the stock aging report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Stock Aging Report</h2>
      <div className="filter-bar">
        <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
        <input
          type="number"
          min="1"
          placeholder="Days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          style={{ width: '100px' }}
        />
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
      {rows && rows.length === 0 && <div className="empty-state">No aged stock for these parameters.</div>}
      {rows && rows.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Location</th>
                <th>Balance</th>
                <th>Cost</th>
                <th>Last Transaction</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((r, i) => (
                <tr key={i}>
                  <td>{r.ItemCode}</td>
                  <td>{r.Description ?? '—'}</td>
                  <td>{r.Location ?? '—'}</td>
                  <td>{r.Balance}</td>
                  <td>{r.COST}</td>
                  <td>{r.LastTranDate ? new Date(r.LastTranDate).toLocaleDateString() : '—'}</td>
                  <td>{r.Days}</td>
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
