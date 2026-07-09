import { useState } from 'react';
import { ledgerApi, BalanceSheetRow } from '../api/ledgerApi';
import { ApiError } from '../api/client';

export function BalanceSheetReportPage() {
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<BalanceSheetRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows(await ledgerApi.balanceSheet(fromDate, toDate));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load balance sheet.');
    } finally {
      setLoading(false);
    }
  }

  const postable = rows?.filter((r) => !r.isGroup) ?? [];
  const totalDebit = postable.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = postable.reduce((sum, r) => sum + r.credit, 0);

  return (
    <div className="section-card">
      <h2>Balance Sheet</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Full chart-of-accounts hierarchy with cumulative debit/credit for the selected date range. Indentation
        follows the account tree; bold rows are group headings.
      </p>
      <div className="filter-bar">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {rows && (
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
            <strong>Postable accounts:</strong> {postable.length}
          </div>
          <div>
            <strong>Total Debit:</strong> {totalDebit.toFixed(2)}
          </div>
          <div>
            <strong>Total Credit:</strong> {totalCredit.toFixed(2)}
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
                <th>Code</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 1000).map((r, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: `calc(var(--space-3) * ${r.depth})`, fontWeight: r.isGroup ? 600 : 400 }}>
                    {r.description ?? '—'}
                  </td>
                  <td>{r.codes}</td>
                  <td>{r.debit ? r.debit.toFixed(2) : '—'}</td>
                  <td>{r.credit ? r.credit.toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 1000 && (
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
              Showing first 1000 of {rows.length} rows.
            </p>
          )}
        </>
      )}
    </div>
  );
}
