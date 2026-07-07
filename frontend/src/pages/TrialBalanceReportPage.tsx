import { useState } from 'react';
import { ledgerApi, TrialBalanceRow, TrialBalanceSummary } from '../api/ledgerApi';
import { ApiError } from '../api/client';

export function TrialBalanceReportPage() {
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<TrialBalanceRow[] | null>(null);
  const [summary, setSummary] = useState<TrialBalanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await ledgerApi.trialBalance(fromDate, toDate);
      setRows(res.rows);
      setSummary(res.summary);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load trial balance.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Trial Balance</h2>
      <div className="filter-bar">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {summary && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-6)',
            margin: 'var(--space-4) 0',
            padding: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div>
            <strong>Accounts:</strong> {summary.accountCount}
          </div>
          <div>
            <strong>Total Debit:</strong> {summary.totalDebit}
          </div>
          <div>
            <strong>Total Credit:</strong> {summary.totalCredit}
          </div>
          <div>
            <strong>Balanced:</strong> {summary.balanced ? 'Yes' : 'No'}
          </div>
        </div>
      )}

      {rows && rows.length === 0 && <div className="empty-state">No data for this date range.</div>}
      {rows && rows.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((r, i) => (
                <tr key={i}>
                  <td>{r.ac ?? '—'}</td>
                  <td>{r.description ?? '—'}</td>
                  <td>{r.debit ?? 0}</td>
                  <td>{r.credit ?? 0}</td>
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
