import { useEffect, useState } from 'react';
import { purchaseApi, PurchaseVehicleLink } from '../api/purchaseApi';
import { Pagination } from '../components/Pagination';
import { ApiError } from '../api/client';

export function PurchaseVehicleLinkPage() {
  const [items, setItems] = useState<PurchaseVehicleLink[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [pInvNo, setPInvNo] = useState('');
  const [vehNo, setVehNo] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    purchaseApi
      .listVehicleLinks({ page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load purchase vehicle links. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, limit]);

  async function handleAdd() {
    if (!pInvNo.trim() || !vehNo.trim()) return;
    setSaving(true);
    setBanner(null);
    try {
      await purchaseApi.createVehicleLink({ pInvNo: pInvNo.trim(), vehNo: vehNo.trim() });
      setPInvNo('');
      setVehNo('');
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to link vehicle.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setBanner(null);
    try {
      await purchaseApi.deleteVehicleLink(id);
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to unlink vehicle.');
    }
  }

  return (
    <div className="section-card">
      <h2>Purchase Vehicle Link</h2>

      <div className="filter-bar">
        <input placeholder="Purchase Invoice #..." value={pInvNo} onChange={(e) => setPInvNo(e.target.value)} />
        <input placeholder="Vehicle #..." value={vehNo} onChange={(e) => setVehNo(e.target.value)} />
        <button className="btn-primary" onClick={handleAdd} disabled={saving || !pInvNo.trim() || !vehNo.trim()}>
          Link Vehicle
        </button>
      </div>

      {banner && <div className="alert alert-error">{banner}</div>}
      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Purchase Invoice #</th>
                <th>Vehicle #</th>
                <th>Amount</th>
                <th>Completed</th>
                <th>Actions</th>
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
                    No vehicle links found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((v) => (
                  <tr key={v.id}>
                    <td>{v.pInvNo ?? '—'}</td>
                    <td>{v.vehNo ?? '—'}</td>
                    <td>{v.amount ?? '—'}</td>
                    <td>{v.completed ? 'Yes' : 'No'}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleDelete(v.id)}>
                        Unlink
                      </button>
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
