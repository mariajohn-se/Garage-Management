import { useEffect, useState } from 'react';
import { inventoryApi, CurrentStockItem } from '../api/inventoryApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function CurrentStockPage() {
  const [items, setItems] = useState<CurrentStockItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    inventoryApi
      .currentStock({ search: search || undefined, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load current stock. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="section-card">
      <h2>Current Stock / Availability</h2>

      <div className="filter-bar">
        <input
          placeholder="Search item code or description..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Tag</th>
                <th>Description</th>
                <th>Location</th>
                <th>Stock</th>
                <th>Cost</th>
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
                    No items found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((s, i) => (
                  <tr key={`${s.itemCode}-${i}`}>
                    <td>{s.itemCode}</td>
                    <td>{s.tag ?? '—'}</td>
                    <td>{s.description ?? '—'}</td>
                    <td>{s.location ?? '—'}</td>
                    <td>{s.stock ?? '—'}</td>
                    <td>{s.cost ?? '—'}</td>
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
