import { useEffect, useState } from 'react';
import { inventoryApi, ReorderStatusItem } from '../api/inventoryApi';
import { Pagination } from '../components/Pagination';

export function ReorderStatusPage() {
  const [items, setItems] = useState<ReorderStatusItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    inventoryApi
      .reorderStatus({ page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load reorder status. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return (
    <div className="section-card">
      <h2>Reorder Status</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>Items whose stock on hand is at or below their reorder level.</p>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Stock</th>
                <th>Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={4} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No items at or below reorder level.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((s) => (
                  <tr key={s.itemCode}>
                    <td>{s.itemCode}</td>
                    <td>{s.description ?? '—'}</td>
                    <td>{s.stock ?? '—'}</td>
                    <td>{s.reorderLevel ?? '—'}</td>
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
