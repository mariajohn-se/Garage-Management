import { useEffect, useState } from 'react';
import { reportingApi, MenuItem } from '../api/reportingApi';
import { ApiError } from '../api/client';

export function MainMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    reportingApi
      .listMenu()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load the main menu.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-card">
      <h2>Main Menu (Legacy Structure)</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>
        The real menu hierarchy from the original desktop application, grouped by level - not an editable feature here,
        but a live reference to how the legacy app organizes navigation (also the source for the per-user menu
        permission editor in User &amp; Role Management).
      </p>

      {loading && <div className="empty-state">Loading...</div>}
      {error && <div className="error-state">{error}</div>}
      {!loading && !error && items.length === 0 && <div className="empty-state">No menu items found.</div>}
      {!loading && !error && items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Menu ID</th>
              <th>Name</th>
              <th>Level</th>
              <th>Sub Level</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.mnuId}>
                <td>{m.mnuId}</td>
                <td style={{ paddingLeft: `${((m.level ?? 1) - 1) * 16}px` }}>{m.mnuName ?? '—'}</td>
                <td>{m.level ?? '—'}</td>
                <td>{m.subLevel ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
