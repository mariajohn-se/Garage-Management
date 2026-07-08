import { useState } from 'react';
import { customerApi } from '../api/partyApi';
import { ApiError } from '../api/client';

export function CustomerAgewisePage() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Array<{ bucket: string; amount: number }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    setRows(null);
    try {
      setRows(await customerApi.agewise(asOfDate));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the agewise report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card" data-testid="cust-agewise-panel">
      <h2>Customer Agewise Report</h2>
      <div className="filter-bar">
        <input
          type="date"
          data-testid="cust-agewise-date"
          value={asOfDate}
          onChange={(e) => setAsOfDate(e.target.value)}
        />
        <button className="btn-primary" data-testid="cust-agewise-run" onClick={handleRun} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {rows && rows.length === 0 && <div className="empty-state">No data returned for this date.</div>}
      {rows && rows.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Bucket</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.bucket}</td>
                <td>{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
