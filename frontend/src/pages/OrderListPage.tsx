import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, SalesOrder } from '../api/salesApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function OrderListPage() {
  const [items, setItems] = useState<SalesOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ ordr: '', customerName: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    orderApi
      .list({ ...filters, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load sales orders. Please try again.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  return (
    <div className="section-card" data-testid="salesorder-table">
      <h2>Sales Orders</h2>

      <div className="filter-bar">
        <input
          placeholder="Order #..."
          value={filters.ordr}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, ordr: e.target.value }));
          }}
        />
        <input
          placeholder="Customer..."
          value={filters.customerName}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, customerName: e.target.value }));
          }}
        />
        <select
          value={filters.status}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, status: e.target.value }));
          }}
        >
          <option value="">All</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending</option>
        </select>
        <div className="actions-bar">
          <Link className="btn-outline" data-testid="salesorder-btn-new" to="/orders/new">
            + New Order
          </Link>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Advisor</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={7} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No sales orders found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((o, i) => (
                  <tr key={o.id} data-testid={`salesorder-table-row-${i}`}>
                    <td>{o.ordr}</td>
                    <td>{o.customerName ?? '—'}</td>
                    <td>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '—'}</td>
                    <td>{o.staffName ?? '—'}</td>
                    <td>{o.jobStatus ?? (o.delivered ? 'Delivered' : 'Pending')}</td>
                    <td>{o.net ?? o.total ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link className="btn-outline" to={`/orders/${o.id}`}>
                          View
                        </Link>
                        <Link className="btn-outline" to={`/orders/${o.id}/edit`}>
                          Edit
                        </Link>
                      </div>
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
