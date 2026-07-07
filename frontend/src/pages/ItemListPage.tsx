import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi, Item } from '../api/inventoryApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function ItemListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    inventoryApi
      .listItems({ search, lowStock, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load items. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, lowStock, page]);

  return (
    <div className="section-card">
      <h2>Items</h2>

      <div className="filter-bar">
        <input
          placeholder="Search item code or description..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => {
              setPage(1);
              setLowStock(e.target.checked);
            }}
          />
          Low stock only
        </label>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Sales Rate</th>
                <th>Stock</th>
                <th>Reorder Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={8} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No items found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((it) => (
                  <tr key={it.itemCode}>
                    <td>{it.itemCode}</td>
                    <td>{it.description ?? '—'}</td>
                    <td>{it.category ?? '—'}</td>
                    <td>{it.denom ?? '—'}</td>
                    <td>{it.salesRate ?? '—'}</td>
                    <td>{it.stock ?? '—'}</td>
                    <td>{it.reorderLevel ?? '—'}</td>
                    <td>
                      <Link className="btn-outline" to={`/inventory/items/${encodeURIComponent(it.itemCode)}`}>
                        View
                      </Link>
                    </td>
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
