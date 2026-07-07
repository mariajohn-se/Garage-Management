import { useEffect, useState } from 'react';
import { salesApi, Proforma } from '../api/salesApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function ProformasPage() {
  const [items, setItems] = useState<Proforma[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    salesApi
      .proformas({ page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load proformas. Please try again.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="section-card">
      <h2>Proforma Sales</h2>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Proforma #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Type</th>
                <th>Total</th>
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
                    No proformas found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.bill ?? '—'}</td>
                    <td>{p.customerName ?? '—'}</td>
                    <td>{p.vehNo || '—'}</td>
                    <td>{p.billDate ? new Date(p.billDate).toLocaleDateString() : '—'}</td>
                    <td>{p.voucherType ?? '—'}</td>
                    <td>{p.net ?? p.total ?? '—'}</td>
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
