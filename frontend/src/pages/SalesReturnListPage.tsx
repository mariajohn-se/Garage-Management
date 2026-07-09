import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesReturnApi, SalesReturnListItem } from '../api/salesReturnApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function SalesReturnListPage() {
  const [items, setItems] = useState<SalesReturnListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    salesReturnApi
      .list({ page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load sales returns. Please try again.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Sales Returns</h2>
        <Link className="btn-primary" style={{ width: 'auto' }} to="/sales-returns/new">
          New Sales Return
        </Link>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Return #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Bill Ref</th>
                <th>Type</th>
                <th>Total</th>
                <th>Remarks</th>
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
                    No sales returns found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.sretNo ?? '—'}</td>
                    <td>{r.sretDt ? new Date(r.sretDt).toLocaleDateString() : '—'}</td>
                    <td>{r.custName ?? '—'}</td>
                    <td>{r.bill ?? '—'}</td>
                    <td>{r.corQ ?? '—'}</td>
                    <td>{r.nett ?? 0}</td>
                    <td>{r.remarks ?? '—'}</td>
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
