import { useEffect, useState } from 'react';
import { purchaseApi, PurchaseReturn } from '../api/purchaseApi';
import { Pagination } from '../components/Pagination';

export function PurchaseReturnsPage() {
  const [items, setItems] = useState<PurchaseReturn[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    purchaseApi
      .listReturns({ page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load purchase returns. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return (
    <div className="section-card">
      <h2>Purchase Returns</h2>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Return #</th>
                <th>Invoice</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Total</th>
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
                    No purchase returns found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.pretNo ?? '—'}</td>
                    <td>{r.invoice ?? '—'}</td>
                    <td>{r.supplierId ?? '—'}</td>
                    <td>{r.pretDate ? new Date(r.pretDate).toLocaleDateString() : '—'}</td>
                    <td>{r.net ?? r.total ?? '—'}</td>
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
