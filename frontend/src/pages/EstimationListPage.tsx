import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { estimationApi, EstimationListItem } from '../api/jobApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function EstimationListPage() {
  const [items, setItems] = useState<EstimationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ customerName: '', vehNo: '', approved: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    estimationApi
      .list({ ...filters, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load estimations. Please try again.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  return (
    <div className="section-card" data-testid="estimation-report-table">
      <h2>Estimations</h2>

      <div className="filter-bar">
        <input
          placeholder="Customer..."
          value={filters.customerName}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, customerName: e.target.value }));
          }}
        />
        <input
          placeholder="Vehicle No..."
          value={filters.vehNo}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, vehNo: e.target.value }));
          }}
        />
        <select
          value={filters.approved}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, approved: e.target.value }));
          }}
        >
          <option value="">All</option>
          <option value="yes">Approved</option>
          <option value="no">Not Approved</option>
        </select>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Advisor</th>
                <th>Bill Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={8} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No estimation records found for these parameters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((e) => (
                  <tr key={e.id}>
                    <td>{e.jobCardNo ?? '—'}</td>
                    <td>{e.customerName ?? '—'}</td>
                    <td>{e.vehNo ?? '—'}</td>
                    <td>{e.staffName ?? '—'}</td>
                    <td>{e.billDate ? new Date(e.billDate).toLocaleDateString() : '—'}</td>
                    <td>{e.net ?? e.total ?? '—'}</td>
                    <td>{e.approved ? 'Approved' : e.rejected ? 'Rejected' : 'Pending'}</td>
                    <td>
                      <Link
                        className="btn-outline"
                        data-testid={`estimation-report-action-view-${e.id}`}
                        to={`/estimations/${e.id}`}
                      >
                        View
                      </Link>
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
