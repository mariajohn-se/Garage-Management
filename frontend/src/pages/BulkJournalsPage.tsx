import { useEffect, useState } from 'react';
import { ledgerApi, BulkJournalEntry } from '../api/ledgerApi';
import { Pagination } from '../components/Pagination';

export function BulkJournalsPage() {
  const [items, setItems] = useState<BulkJournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    ledgerApi
      .listBulkJournals({ page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load bulk journal entries. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return (
    <div className="section-card">
      <h2>Bulk Journal Entries</h2>
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
                <th>Cr/Dr</th>
                <th>Amount</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={5} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No bulk journal entries found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((b) => (
                  <tr key={b.id}>
                    <td>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                    <td>{b.accountName ?? b.ac ?? '—'}</td>
                    <td>{b.crDr ?? '—'}</td>
                    <td>{b.netAmt ?? 0}</td>
                    <td>{b.narration ?? '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
