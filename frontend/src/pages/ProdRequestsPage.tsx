import { useEffect, useState } from 'react';
import { purchaseApi, ProdRequest } from '../api/purchaseApi';
import { Pagination } from '../components/Pagination';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const LIMIT = 25;

export function ProdRequestsPage() {
  const { session } = useAuth();
  const canManage = session?.roles.some((r) => r === 'Supervisor' || r === 'Administrator');
  const [items, setItems] = useState<ProdRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    purchaseApi
      .listProdRequests({ page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load product requests. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  async function handleAdd() {
    if (!supplierId.trim()) return;
    setSaving(true);
    setBanner(null);
    try {
      await purchaseApi.createProdRequest({ supplierId: supplierId.trim(), remarks: remarks.trim() || undefined });
      setSupplierId('');
      setRemarks('');
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to create request.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setBanner(null);
    try {
      await purchaseApi.deleteProdRequest(id);
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to delete request.');
    }
  }

  return (
    <div className="section-card">
      <h2>Product Requests</h2>

      {canManage && (
        <div className="filter-bar">
          <input placeholder="Supplier ID..." value={supplierId} onChange={(e) => setSupplierId(e.target.value)} />
          <input placeholder="Remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <button className="btn-primary" onClick={handleAdd} disabled={saving || !supplierId.trim()}>
            Add Request
          </button>
        </div>
      )}

      {banner && <div className="alert alert-error">{banner}</div>}
      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Remarks</th>
                {canManage && <th>Actions</th>}
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
                    No product requests found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.refNo ?? '—'}</td>
                    <td>{r.supplierName ?? '—'}</td>
                    <td>{r.refDate ? new Date(r.refDate).toLocaleDateString() : '—'}</td>
                    <td>{r.remarks ?? '—'}</td>
                    {canManage && (
                      <td>
                        <button className="btn-danger" onClick={() => handleDelete(r.id)}>
                          Delete
                        </button>
                      </td>
                    )}
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
