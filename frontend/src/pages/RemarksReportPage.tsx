import { useEffect, useState } from 'react';
import { remarksApi, AdditionalRemark } from '../api/documentApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function RemarksReportPage() {
  const [items, setItems] = useState<AdditionalRemark[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    remarksApi
      .report({ search, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load the remarks report. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="section-card" data-testid="remarks-report-table">
      <h2>Additional Remarks Report</h2>

      <div className="filter-bar">
        <input
          data-testid="remarks-report-filter-apply"
          placeholder="Search remarks, customer, or vehicle..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Staff</th>
                <th>Remark</th>
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
                    No remarks match current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.entryDate ?? '—'}</td>
                    <td>{r.ordr}</td>
                    <td>{r.customerName ?? '—'}</td>
                    <td>{r.vehNo ?? '—'}</td>
                    <td>{r.staffName ?? '—'}</td>
                    <td>{r.remarks}</td>
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
