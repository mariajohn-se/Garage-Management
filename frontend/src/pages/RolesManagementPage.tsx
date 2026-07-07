import { useEffect, useState } from 'react';
import { userApi, UserListItem, MenuPermission } from '../api/userApi';
import { ApiError } from '../api/client';

/**
 * FRONTEND_SPEC_v12.md describes this page as an editable Role x Permission matrix
 * (Standard/Supervisor/Administrator columns, features as rows, changes apply to every user
 * with that role). The real schema has no role-template concept at all - UserRights(User,
 * mnuId) grants menu access per INDIVIDUAL user, not per role (see UserRepository.ts header).
 * Rather than fake a shared "role" entity that doesn't exist in the data, this page is
 * honestly a per-user menu access editor: pick a user, then grant/revoke their individual
 * menu permissions. See README.md for the flag to revisit once someone confirms how
 * roles/permissions are really meant to work in the legacy app.
 */
export function RolesManagementPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .list({})
      .then(setUsers)
      .catch(() => setError('Unable to load users. Please try again.'))
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    if (selectedUserId === null) return;
    setLoadingPerms(true);
    setError(null);
    userApi
      .getPermissions(selectedUserId)
      .then(setPermissions)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Unable to update permissions. Please try again.')
      )
      .finally(() => setLoadingPerms(false));
  }, [selectedUserId]);

  async function togglePermission(perm: MenuPermission) {
    if (selectedUserId === null) return;
    setBanner(null);
    try {
      await userApi.setPermission(selectedUserId, perm.menuId, !perm.granted);
      setPermissions((prev) => prev.map((p) => (p.menuId === perm.menuId ? { ...p, granted: !p.granted } : p)));
      setBanner('Changes saved.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update permissions. Please try again.');
    }
  }

  return (
    <div className="section-card">
      <h2>Role &amp; Permissions Management</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
        The legacy database grants menu access per individual user rather than via shared role templates, so permissions
        are edited per-user here.
      </p>

      <div className="filter-bar">
        <select
          data-testid="roles-selector"
          value={selectedUserId ?? ''}
          disabled={loadingUsers}
          onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Select a user...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username} ({u.roles.join(', ')})
            </option>
          ))}
        </select>
      </div>

      {banner && <div className="alert alert-success">{banner}</div>}
      {error && <div className="error-state">{error}</div>}

      {selectedUserId !== null && !error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Feature / Module</th>
              <th>Granted</th>
            </tr>
          </thead>
          <tbody>
            {loadingPerms &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={2} />
                </tr>
              ))}
            {!loadingPerms && permissions.length === 0 && (
              <tr>
                <td colSpan={2} className="empty-state">
                  No menu items found.
                </td>
              </tr>
            )}
            {!loadingPerms &&
              permissions.map((perm) => (
                <tr key={perm.menuId}>
                  <td>{perm.menuName}</td>
                  <td>
                    <input
                      type="checkbox"
                      data-testid={`roles-perm-${perm.menuId}`}
                      checked={perm.granted}
                      onChange={() => togglePermission(perm)}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
