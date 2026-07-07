import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { purchaseApi, LocalPurchaseOrder } from '../api/purchaseApi';
import { Pagination } from '../components/Pagination';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const LIMIT = 25;

export function LocalPurchaseListPage() {
  const { session } = useAuth();
  const canManage = session?.roles.some((r) => r === 'Supervisor' || r === 'Administrator');
  const [items, setItems] = useState<LocalPurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ supplierName: '', invoice: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    purchaseApi
      .listLocal({ ...filters, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load purchase orders. Please try again.'))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [filters, page]);

  async function handleDelete(id: number) {
    setBanner(null);
    try {
      await purchaseApi.deleteLocal(id);
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to delete purchase order.');
    }
  }

  return (
    <div className="section-card" data-testid="localpurchase-table">
      <h2>Local Purchase Orders</h2>

      <div className="filter-bar">
        <input
          placeholder="Supplier..."
          value={filters.supplierName}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, supplierName: e.target.value }));
          }}
        />
        <input
          placeholder="Invoice #..."
          value={filters.invoice}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, invoice: e.target.value }));
          }}
        />
        <div className="actions-bar">
          <Link className="btn-outline" to="/purchases/local/new">
            + New
          </Link>
        </div>
      </div>

      {banner && <div className="alert alert-error">{banner}</div>}
      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
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
                    No purchase orders found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.invoice ?? '—'}</td>
                    <td>{p.supplierName ?? '—'}</td>
                    <td>{p.invoiceDate ? new Date(p.invoiceDate).toLocaleDateString() : '—'}</td>
                    <td>{p.currency ?? '—'}</td>
                    <td>{p.net ?? p.total ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link className="btn-outline" to={`/purchases/local/${p.id}/edit`}>
                          Edit
                        </Link>
                        {canManage && (
                          <button className="btn-outline" onClick={() => handleDelete(p.id)}>
                            Delete
                          </button>
                        )}
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
