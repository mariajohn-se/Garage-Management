import { useEffect, useState } from 'react';
import { bankingApi, BankAccount, CashBankEntry } from '../api/bankingApi';
import { ApiError } from '../api/client';

export function CashBankBookPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [account, setAccount] = useState('');
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<CashBankEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bankingApi
      .listBankAccounts()
      .then((accts) => {
        setAccounts(accts);
        if (accts.length > 0) setAccount(accts[0].code);
      })
      .catch(() => setError('Unable to load bank/cash accounts.'));
  }, []);

  async function run() {
    if (!account) {
      setError('Select an account first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRows(await bankingApi.cashBankDetails(account, fromDate, toDate, 'All'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load cash/bank book.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Cash / Bank Book</h2>
      <div className="filter-bar">
        <select value={account} onChange={(e) => setAccount(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.code} value={a.code}>
              {a.description ?? a.code}
            </option>
          ))}
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {rows && rows.length === 0 && <div className="empty-state">No entries for this account and date range.</div>}
      {rows && rows.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Cheque</th>
                <th>Narration</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((r, i) => (
                <tr key={i}>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                  <td>{r.vtype ?? '—'}</td>
                  <td>{r.description ?? '—'}</td>
                  <td>{r.chq || '—'}</td>
                  <td>{r.narration ?? '—'}</td>
                  <td>{r.debit ?? 0}</td>
                  <td>{r.credit ?? 0}</td>
                  <td>{r.curBal ?? '—'}</td>
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
