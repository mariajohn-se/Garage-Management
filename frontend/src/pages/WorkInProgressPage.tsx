import { useEffect, useState } from 'react';
import { jobApi, WorkInProgressItem } from '../api/jobApi';
import { Pagination } from '../components/Pagination';

export function WorkInProgressPage() {
  const [items, setItems] = useState<WorkInProgressItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [ordr, setOrdr] = useState('');
  const [empName, setEmpName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    jobApi
      .listWorkInProgress({ ordr, empName, page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load work in progress. Please try again.'))
      .finally(() => setLoading(false));
  }, [ordr, empName, page, limit]);

  return (
    <div className="section-card" data-testid="workstatus-table">
      <h2>Work In Progress</h2>

      <div className="filter-bar">
        <input
          placeholder="Order #..."
          value={ordr}
          onChange={(e) => {
            setPage(1);
            setOrdr(e.target.value);
          }}
        />
        <input
          placeholder="Employee..."
          value={empName}
          onChange={(e) => {
            setPage(1);
            setEmpName(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Order #</th>
                <th>Activity</th>
                <th>Logged In</th>
                <th>Status</th>
                <th>Total Time</th>
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
                    No work in progress records found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((w, i) => (
                  <tr key={w.id} data-testid={`workstatus-row-${i}`}>
                    <td>{w.empName ?? '—'}</td>
                    <td>{w.ordr ?? '—'}</td>
                    <td>{w.workDescription ?? w.activityCode ?? '—'}</td>
                    <td>{w.loggedIn ? new Date(w.loggedIn).toLocaleString() : '—'}</td>
                    <td>{w.status ?? '—'}</td>
                    <td>{w.totalTime ?? '—'}</td>
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
