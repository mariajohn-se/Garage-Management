import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchaseApi, ForeignPurchaseOrder } from '../api/purchaseApi';
import { Pagination } from '../components/Pagination';

export function ForeignPurchaseListPage() {
  const [items, setItems] = useState<ForeignPurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [supplierName, setSupplierName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    purchaseApi
      .listForeign({ supplierName, page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load foreign purchase orders. Please try again.'))
      .finally(() => setLoading(false));
  }, [supplierName, page, limit]);

  return (
    <div className="section-card">
      <h2>Foreign Purchase Orders</h2>

      <div className="filter-bar">
        <input
          placeholder="Search supplier..."
          value={supplierName}
          onChange={(e) => {
            setPage(1);
            setSupplierName(e.target.value);
          }}
        />
        <div className="actions-bar">
          <Link className="btn-primary" to="/purchases/foreign/new">
            + New
          </Link>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>PO #</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Currency</th>
                <th>Total</th>
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
                    No foreign purchase orders found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.poOrder ?? '—'}</td>
                    <td>{p.supplierName ?? '—'}</td>
                    <td>{p.orderDate ? new Date(p.orderDate).toLocaleDateString() : '—'}</td>
                    <td>{p.currency ?? '—'}</td>
                    <td>{p.net ?? p.total ?? '—'}</td>
                    <td>
                      <Link className="btn-outline" to={`/purchases/foreign/${p.id}/edit`}>
                        Edit
                      </Link>
                    </td>
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
