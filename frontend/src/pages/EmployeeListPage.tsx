import { useEffect, useState } from 'react';
import { userApi, Employee } from '../api/userApi';
import { ApiError } from '../api/client';

export function EmployeeListPage() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    userApi
      .employees({ name })
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load employees.'))
      .finally(() => setLoading(false));
  }, [name]);

  return (
    <div className="section-card" data-testid="emplist-table">
      <h2>Employee List</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
        Reads from the <code>EmployeeSql</code> view per STANDARDS.md. That view currently returns 0 rows in production
        (an inner join to Section/Department lookups drops every real employee row) - see README.md. This is a
        pre-existing legacy data issue, not a bug in this page.
      </p>

      <div className="filter-bar">
        <input
          data-testid="emplist-filter-name"
          placeholder="Search name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Section</th>
              <th>Designation</th>
              <th>Hire Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={7} />
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  No employees found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.empId}>
                  <td>{r.name}</td>
                  <td>{r.tel1 ?? r.telMob ?? '—'}</td>
                  <td>{r.department ?? '—'}</td>
                  <td>{r.section ?? '—'}</td>
                  <td>{r.designation ?? '—'}</td>
                  <td>{r.dateOfJoining ? new Date(r.dateOfJoining).toLocaleDateString() : '—'}</td>
                  <td>{r.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
