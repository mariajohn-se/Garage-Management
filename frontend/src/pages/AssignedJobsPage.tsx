import { useEffect, useState } from 'react';
import { jobApi, AssignedJobItem } from '../api/jobApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function AssignedJobsPage() {
  const [items, setItems] = useState<AssignedJobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ordr, setOrdr] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    jobApi
      .listAssigned({ ordr, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load assigned jobs. Please try again.'))
      .finally(() => setLoading(false));
  }, [ordr, page]);

  return (
    <div className="section-card">
      <h2>Assigned Jobs</h2>

      <div className="filter-bar">
        <input
          placeholder="Order #..."
          value={ordr}
          onChange={(e) => {
            setPage(1);
            setOrdr(e.target.value);
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
                <th>Employee</th>
                <th>Date Assigned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={4} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No assigned jobs match current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((a) => (
                  <tr key={a.dtlId}>
                    <td>{a.ordr}</td>
                    <td>{a.empName ?? '—'}</td>
                    <td>{a.dateOfAssign ? new Date(a.dateOfAssign).toLocaleString() : '—'}</td>
                    <td>{a.status ?? '—'}</td>
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
