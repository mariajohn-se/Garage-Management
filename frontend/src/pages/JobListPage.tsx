import { useEffect, useState } from 'react';
import { jobApi, JobListItem } from '../api/jobApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function JobListPage() {
  const [items, setItems] = useState<JobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    jobApi
      .list({ customerName, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load jobs. Please try again.'))
      .finally(() => setLoading(false));
  }, [customerName, page]);

  return (
    <div className="section-card" data-testid="jobstatus-table">
      <h2>Jobs / Work Orders</h2>

      <div className="filter-bar">
        <input
          placeholder="Search customer..."
          value={customerName}
          onChange={(e) => {
            setPage(1);
            setCustomerName(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Advisor</th>
                <th>Notes</th>
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
                    No jobs match current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((j, i) => (
                  <tr key={j.id} data-testid={`jobstatus-row-${i}`}>
                    <td>{j.ordr}</td>
                    <td>{j.customerName ?? '—'}</td>
                    <td>{j.vehNo ?? '—'}</td>
                    <td>{j.statusDescription ?? j.status ?? '—'}</td>
                    <td>{j.staffName ?? '—'}</td>
                    <td>{j.remarks ?? '—'}</td>
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
