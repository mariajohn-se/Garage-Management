import { useEffect, useState } from 'react';
import { authApi, UserLogEntry } from '../api/authApi';
import { ApiError } from '../api/client';

const EVENT_TYPES = ['Sign In', 'Failed Sign In', 'Password Change', 'Password Reset', 'Lockout'];

function exportRows(rows: UserLogEntry[], format: 'csv' | 'xlsx' | 'pdf') {
  if (format !== 'csv') {
    // Excel/PDF rendering pipelines belong to Phase 12 (Reporting & Analytics) - CSV is a
    // real, working export today rather than leaving all three buttons as no-op stubs.
    window.alert(`${format.toUpperCase()} export is implemented in the Phase 12 reporting module.`);
    return;
  }
  const header = ['User', 'Event', 'Date', 'IP Address', 'Machine', 'Remarks'];
  const lines = rows.map((r) =>
    [r.userName, r.actionName, r.actionDate, r.ipAddress, r.machineName, r.remarks]
      .map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
      .join(',')
  );
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'user-log.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function UserLogReportPage() {
  const [rows, setRows] = useState<UserLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ userId: '', dateFrom: '', dateTo: '', eventType: '' });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    authApi
      .userLog(filters)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Unable to load user logs. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="section-card">
      <h2>User Authentication Log</h2>

      <div className="filter-bar">
        <input
          type="number"
          data-testid="userlog-filter-user"
          placeholder="User ID..."
          value={filters.userId}
          onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}
        />
        <input
          type="date"
          data-testid="userlog-filter-from"
          value={filters.dateFrom}
          onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
        />
        <input
          type="date"
          data-testid="userlog-filter-to"
          value={filters.dateTo}
          onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
        />
        <select
          data-testid="userlog-filter-eventtype"
          value={filters.eventType}
          onChange={(e) => setFilters((f) => ({ ...f, eventType: e.target.value }))}
        >
          <option value="">All events</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="actions-bar">
          <button className="btn-outline" data-testid="userlog-export-csv" onClick={() => exportRows(rows, 'csv')}>
            Export CSV
          </button>
          <button className="btn-outline" data-testid="userlog-export-xls" onClick={() => exportRows(rows, 'xlsx')}>
            Export Excel
          </button>
          <button className="btn-outline" data-testid="userlog-export-pdf" onClick={() => exportRows(rows, 'pdf')}>
            Export PDF
          </button>
          <button className="btn-outline" data-testid="userlog-print" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Event Type</th>
              <th>Date/Time</th>
              <th>IP Address</th>
              <th>Machine Name</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={6} />
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  No user log records match the current filters.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row, i) => (
                <tr key={row.slNo} data-testid={`userlog-row-${i}`}>
                  <td>{row.userName ?? '—'}</td>
                  <td>{row.actionName ?? '—'}</td>
                  <td>{row.actionDate ? new Date(row.actionDate).toLocaleString() : '—'}</td>
                  <td>{row.ipAddress ?? '—'}</td>
                  <td>{row.machineName ?? '—'}</td>
                  <td>{row.remarks ?? '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
