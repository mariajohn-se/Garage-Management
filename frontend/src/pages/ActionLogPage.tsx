import { useEffect, useState } from 'react';
import { userApi } from '../api/userApi';
import { ApiError } from '../api/client';

/**
 * FRONTEND_SPEC_v12.md describes this as a distinct "all user actions" log separate from
 * Phase 1's auth-focused /admin/user-logs, but no separate action-log table exists in
 * DB_CONNECTION_SPEC_v12.md - both pages read the same UserLog table (see
 * backend/src/controllers/UserController.ts#actionLog).
 */
export function ActionLogPage() {
  const [rows, setRows] = useState<
    Array<{
      slNo: number;
      userName: string | null;
      actionName: string | null;
      actionDate: string | null;
      remarks: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });

  useEffect(() => {
    setLoading(true);
    setError(null);
    userApi
      .actionLog(filters)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load action log.'))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="section-card" data-testid="ulogs-table">
      <h2>User Action Log</h2>

      <div className="filter-bar">
        <input
          type="date"
          data-testid="ulogs-filter-from"
          value={filters.dateFrom}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
        />
        <input
          type="date"
          data-testid="ulogs-filter-to"
          value={filters.dateTo}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Date/Time</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={4} />
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  No action log records match the current filters.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.slNo}>
                  <td>{r.userName ?? '—'}</td>
                  <td>{r.actionName ?? '—'}</td>
                  <td>{r.actionDate ? new Date(r.actionDate).toLocaleString() : '—'}</td>
                  <td>{r.remarks ?? '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
