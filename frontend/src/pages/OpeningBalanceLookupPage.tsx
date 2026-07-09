import { useState } from 'react';
import { ledgerApi, OpeningBalanceResult } from '../api/ledgerApi';
import { ApiError } from '../api/client';

export function OpeningBalanceLookupPage() {
  const [ac, setAc] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<OpeningBalanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await ledgerApi.openingBalance(ac.trim(), asOfDate));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to look up opening balance.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Opening Balance</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Computed from every ledger entry before the selected date — there's no stored "opening balance" figure to
        edit, this is the running balance as of that point in time.
      </p>
      <div className="filter-bar">
        <input
          placeholder="Account code (e.g. 1431)"
          value={ac}
          onChange={(e) => setAc(e.target.value)}
        />
        <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading || !ac.trim()}>
          {loading && <span className="spinner" />}
          Look Up
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {result && (
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
            <strong>Account:</strong> {result.ac}
          </div>
          <div>
            <strong>As of:</strong> {new Date(result.asOfDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Debit:</strong> {result.openingDebit.toFixed(2)}
          </div>
          <div>
            <strong>Credit:</strong> {result.openingCredit.toFixed(2)}
          </div>
          <div>
            <strong>Closing:</strong> {result.closing.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
