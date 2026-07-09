import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { estimationApi, EstimationListItem, AdvisorOption } from '../api/jobApi';
import { Pagination } from '../components/Pagination';
import { formatDate, formatMoney } from '../utils/format';

export function EstimationListPage() {
  const [items, setItems] = useState<EstimationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [filters, setFilters] = useState({
    customerName: '',
    vehNo: '',
    approved: '',
    staffId: '',
    fromDate: '',
    toDate: ''
  });
  const [advisors, setAdvisors] = useState<AdvisorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    estimationApi.listAdvisors().then(setAdvisors).catch(() => setAdvisors([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    estimationApi
      .list({ ...filters, page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load estimations. Please try again.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, limit]);

  function updateFilter(patch: Partial<typeof filters>) {
    setPage(1);
    setFilters((f) => ({ ...f, ...patch }));
  }

  return (
    <div className="section-card" data-testid="estimation-report-table">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Estimations</h2>
        <Link className="btn-primary" style={{ width: 'auto' }} to="/estimations/new">
          New Estimation
        </Link>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Customer..."
          value={filters.customerName}
          onChange={(e) => updateFilter({ customerName: e.target.value })}
        />
        <input placeholder="Vehicle No..." value={filters.vehNo} onChange={(e) => updateFilter({ vehNo: e.target.value })} />
        <select value={filters.approved} onChange={(e) => updateFilter({ approved: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="yes">Approved</option>
          <option value="no">Not Approved</option>
        </select>
        <select value={filters.staffId} onChange={(e) => updateFilter({ staffId: e.target.value })}>
          <option value="">All Advisors</option>
          {advisors.map((a) => (
            <option key={a.ocode} value={a.ocode}>
              {a.name}
            </option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          From
          <input type="date" value={filters.fromDate} onChange={(e) => updateFilter({ fromDate: e.target.value })} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          To
          <input type="date" value={filters.toDate} onChange={(e) => updateFilter({ toDate: e.target.value })} />
        </label>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Estm. No</th>
                <th>Job Card #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Advisor</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={9} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No estimation records found for these parameters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((e) => (
                  <tr key={e.id}>
                    <td>{e.estimationNo ?? '—'}</td>
                    <td>{e.jobCardNo && e.jobCardNo !== '0' ? e.jobCardNo : '—'}</td>
                    <td>{e.customerName ?? '—'}</td>
                    <td>{e.vehNo ?? '—'}</td>
                    <td>{e.staffName ?? '—'}</td>
                    <td>{formatDate(e.billDate)}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoney(e.net ?? e.total)}
                    </td>
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
