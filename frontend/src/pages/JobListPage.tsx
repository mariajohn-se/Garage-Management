import { useEffect, useState } from 'react';
import { jobApi, jobStatusMasterApi, JobListItem, JobStatus } from '../api/jobApi';
import { ApiError } from '../api/client';
import { Pagination } from '../components/Pagination';

export function JobListPage() {
  const [items, setItems] = useState<JobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [customerName, setCustomerName] = useState('');
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    jobApi
      .list({ customerName, page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load jobs. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [customerName, page, limit]);
  useEffect(() => {
    jobStatusMasterApi.list().then(setStatuses).catch(() => setStatuses([]));
  }, []);

  async function handleStatusChange(jobId: number, statusId: number) {
    setBanner(null);
    setError(null);
    setUpdatingId(jobId);
    try {
      await jobApi.updateStatus(jobId, statusId);
      setBanner('Job status updated.');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update job status.');
    } finally {
      setUpdatingId(null);
    }
  }

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

      {banner && <div className="alert alert-success">{banner}</div>}
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
                    <td>
                      <select
                        data-testid={`jobstatus-status-select-${i}`}
                        value={j.statusId ?? ''}
                        disabled={updatingId === j.id || statuses.length === 0}
                        onChange={(e) => handleStatusChange(j.id, Number(e.target.value))}
                      >
                        <option value="" disabled>
                          {j.statusDescription ?? j.status ?? 'Select status'}
                        </option>
                        {statuses.map((s) => (
                          <option key={s.statusId} value={s.statusId}>
                            {s.description}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{j.staffName ?? '—'}</td>
                    <td>{j.remarks ?? '—'}</td>
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
