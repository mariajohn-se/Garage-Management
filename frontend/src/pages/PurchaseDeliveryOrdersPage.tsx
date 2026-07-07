import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchaseApi, PurchaseDeliveryOrder } from '../api/purchaseApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function PurchaseDeliveryOrdersPage() {
  const [items, setItems] = useState<PurchaseDeliveryOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [supplierName, setSupplierName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    purchaseApi
      .listDeliveryOrders({ supplierName, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load purchase delivery orders. Please try again.'))
      .finally(() => setLoading(false));
  }, [supplierName, page]);

  return (
    <div className="section-card">
      <h2>Purchase Delivery Orders</h2>

      <div className="filter-bar">
        <input
          placeholder="Search supplier..."
          value={supplierName}
          onChange={(e) => {
            setPage(1);
            setSupplierName(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>DO #</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Total</th>
                <th>Closed</th>
                <th>Actions</th>
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
                    No delivery orders found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((d) => (
                  <tr key={d.id}>
                    <td>{d.pdoNo ?? '—'}</td>
                    <td>{d.supplierName ?? '—'}</td>
                    <td>{d.orderDate ? new Date(d.orderDate).toLocaleDateString() : '—'}</td>
                    <td>{d.net ?? d.total ?? '—'}</td>
                    <td>{d.closed ? 'Yes' : 'No'}</td>
                    <td>
                      <Link className="btn-outline" to={`/purchases/delivery-orders/${d.id}`}>
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
