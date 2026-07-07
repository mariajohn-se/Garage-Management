import { useEffect, useState } from 'react';
import { ledgerApi, BulkPdcEntry } from '../api/ledgerApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function BulkPdcsPage() {
  const [items, setItems] = useState<BulkPdcEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    ledgerApi
      .listBulkPdcs({ page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load bulk PDC entries. Please try again.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="section-card">
      <h2>Bulk PDC Transactions</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Real historical import table - currently empty, meaning this feature has never been used in production.
      </p>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Deposit Code</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={6} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No bulk PDC entries found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((b) => (
                  <tr key={b.id}>
                    <td>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                    <td>{b.accountName ?? b.ac ?? '—'}</td>
                    <td>{b.depoCode ?? '—'}</td>
                    <td>{b.netAmt ?? 0}</td>
                    <td>{b.curBal ?? '—'}</td>
                    <td>{b.narration ?? '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
