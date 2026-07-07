import { useState } from 'react';
import { bankingApi, AccountFilterItem } from '../api/bankingApi';
import { ApiError } from '../api/client';

export function AccountFilterPage() {
  const [dateFrom, setDateFrom] = useState('2011-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [ac, setAc] = useState('');
  const [rows, setRows] = useState<AccountFilterItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows(await bankingApi.filterAccountEntries(dateFrom, dateTo, ac || undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load account filter results.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Account / Voucher Filter</h2>
      <div className="filter-bar">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <input placeholder="Account code (optional)" value={ac} onChange={(e) => setAc(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {rows && rows.length === 0 && <div className="empty-state">No entries for this filter.</div>}
      {rows && rows.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>VSRL</th>
                <th>Date</th>
                <th>Account</th>
                <th>Type</th>
                <th>Ref No</th>
                <th>Narration</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((r, i) => (
                <tr key={i}>
                  <td>{r.vsrl ?? '—'}</td>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                  <td>{r.accountName ?? r.ac ?? '—'}</td>
                  <td>{r.vtype ?? '—'}</td>
                  <td>{r.refNo ?? '—'}</td>
                  <td>{r.narration ?? '—'}</td>
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
