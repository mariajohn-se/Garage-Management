import { useEffect, useState } from 'react';
import { inventoryApi, StockTransaction } from '../api/inventoryApi';
import { Pagination } from '../components/Pagination';

export function StockMovementsPage() {
  const [items, setItems] = useState<StockTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [itemCode, setItemCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    inventoryApi
      .listTransactions({ itemCode: itemCode || undefined, page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load stock movements. Please try again.'))
      .finally(() => setLoading(false));
  }, [itemCode, page, limit]);

  return (
    <div className="section-card">
      <h2>Stock Movements</h2>

      <div className="filter-bar">
        <input
          placeholder="Filter by item code..."
          value={itemCode}
          onChange={(e) => {
            setPage(1);
            setItemCode(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item Code</th>
                <th>Description</th>
                <th>In</th>
                <th>Out</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Ref No</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={9} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No stock movements found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((s) => (
                  <tr key={s.id}>
                    <td>{s.date ? new Date(s.date).toLocaleDateString() : '—'}</td>
                    <td>{s.itemCode ?? '—'}</td>
                    <td>{s.description ?? '—'}</td>
                    <td>{s.stockIn ?? '—'}</td>
                    <td>{s.stockOut ?? '—'}</td>
                    <td>{s.amount ?? '—'}</td>
                    <td>{s.trType ?? '—'}</td>
                    <td>{s.refNo ?? '—'}</td>
                    <td>{s.location ?? '—'}</td>
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
