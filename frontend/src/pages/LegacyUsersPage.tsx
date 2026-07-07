import { useEffect, useState } from 'react';
import { userApi, LegacyUserRecord } from '../api/userApi';
import { ApiError } from '../api/client';

export function LegacyUsersPage() {
  const [rows, setRows] = useState<LegacyUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .legacyUsers()
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load legacy users.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-card" data-testid="legacyuser-table">
      <h2>Legacy User Management</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
        FRONTEND_SPEC_v12.md describes this screen around legacy user accounts with email, status, and a "migrate to new
        user" workflow. The real <code>UserTable</code> table has only two columns (a device ID and a PC name) and 0
        rows in production - it looks like a workstation registration table, not a user-identity table. There is nothing
        to migrate; this page shows the real data as-is rather than fabricating fields that don't exist. See README.md
        for the flag to revisit with someone who knows what this table is really for.
      </p>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>UID</th>
              <th>PC Name</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="skeleton-row">
                <td colSpan={2} />
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={2} className="empty-state">
                  No records found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.uid}>
                  <td>{r.uid}</td>
                  <td>{r.pcName ?? '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
