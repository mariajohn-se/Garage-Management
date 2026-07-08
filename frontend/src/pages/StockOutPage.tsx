import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi, StockEntry } from '../api/inventoryApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function StockOutPage() {
  const [items, setItems] = useState<StockEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    inventoryApi
      .listStockOut({ page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load stock out entries. Please try again.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Stock Out</h2>
        <Link className="btn-primary" style={{ width: 'auto' }} to="/inventory/stock-out/new">
          New Stock Out
        </Link>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock No</th>
                <th>Date</th>
                <th>Ref</th>
                <th>Total</th>
                <th>Net</th>
                <th>Remarks</th>
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
                    No stock out entries found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((s) => (
                  <tr key={s.id}>
                    <td>{s.stockNo ?? '—'}</td>
                    <td>{s.stockDate ? new Date(s.stockDate).toLocaleDateString() : '—'}</td>
                    <td>{s.ref ?? '—'}</td>
                    <td>{s.total ?? '—'}</td>
                    <td>{s.net ?? '—'}</td>
                    <td>{s.remarks ?? '—'}</td>
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
