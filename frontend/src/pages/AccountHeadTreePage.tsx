import { useEffect, useState } from 'react';
import { ledgerApi, AccountHead } from '../api/ledgerApi';
import { ApiError } from '../api/client';

export function AccountHeadTreePage() {
  const [items, setItems] = useState<AccountHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    ledgerApi
      .accountHeadTree()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load the account head tree.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-card">
      <h2>Account Head Tree</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Rendered from each account's real ancestor path (Group Tree), since the legacy account tree procedure fails live
        with a database collation error.
      </p>

      {loading && <div className="empty-state">Loading...</div>}
      {error && <div className="error-state">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="empty-state">No account heads found.</div>}
      {!loading && !error && items.length > 0 && (
        <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm-size)', maxHeight: 700, overflowY: 'auto' }}>
          {items.slice(0, 1000).map((a) => {
            const depth = (a.groupTree ?? '').split(',').length - 1;
            return (
              <div key={a.codes} style={{ paddingLeft: `${depth * 20}px`, padding: '2px 0' }}>
                {a.codes} — {a.description ?? '—'}
              </div>
            );
          })}
          {items.length > 1000 && (
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
              Showing first 1000 of {items.length} account heads.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
