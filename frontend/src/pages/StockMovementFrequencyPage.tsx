import { useState } from 'react';
import { inventoryApi, StockMovementFrequencyItem } from '../api/inventoryApi';
import { ApiError } from '../api/client';

export function StockMovementFrequencyPage() {
  const [fromDate, setFromDate] = useState('2000-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [direction, setDirection] = useState<'fast' | 'slow'>('fast');
  const [items, setItems] = useState<StockMovementFrequencyItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setItems(await inventoryApi.stockMovementFrequency(fromDate, toDate, direction, 50));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load stock movement report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Stock Fast / Slow-Moving Items</h2>
      <div className="filter-bar">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <select value={direction} onChange={(e) => setDirection(e.target.value as 'fast' | 'slow')}>
          <option value="fast">Fast-moving (top 50)</option>
          <option value="slow">Slow-moving (bottom 50)</option>
        </select>
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {items && items.length === 0 && <div className="empty-state">No movement in this date range.</div>}
      {items && items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Item Code</th>
              <th>Tag</th>
              <th>Description</th>
              <th>Movements</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={r.itemCode}>
                <td>{i + 1}</td>
                <td>{r.itemCode}</td>
                <td>{r.tag ?? '—'}</td>
                <td>{r.description ?? '—'}</td>
                <td>{r.movementCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
