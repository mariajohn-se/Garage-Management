import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi, UserListItem } from '../api/userApi';
import { authApi } from '../api/authApi';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function UserListPage() {
  const { session } = useAuth();
  const [rows, setRows] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ name: '', role: '', status: '' });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [banner, setBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    setError(null);
    userApi
      .list(filters)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load users. Please try again.'))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [filters]);

  async function handleStatusChange(user: UserListItem, status: 'active' | 'inactive') {
    setBanner(null);
    try {
      await userApi.setStatus(user.id, status);
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to update user.');
    }
  }

  async function handleUnlock(user: UserListItem) {
    setBanner(null);
    try {
      await authApi.unlockAccount(user.id);
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to unlock account.');
    }
  }

  async function handleBulkDeactivate() {
    if (!selected.size) return;
    setBanner(null);
    try {
      await userApi.bulkSetStatus(Array.from(selected), 'inactive');
      setSelected(new Set());
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to update users.');
    }
  }

  async function handleExport() {
    try {
      const csv = await userApi.exportCsv(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setBanner('Export failed. Please try again.');
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const result = await userApi.importCsv(text);
      setBanner(
        `Imported ${result.created} user(s).${result.skipped.length ? ` Skipped: ${result.skipped.map((s) => `${s.username} (${s.reason})`).join(', ')}` : ''}`
      );
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Import failed.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function toggleSelect(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="section-card">
      <h2>User Management</h2>

      {banner && <div className="alert alert-success">{banner}</div>}

      <div className="filter-bar">
        <input
          data-testid="userlist-filter-name"
          placeholder="Search name..."
          value={filters.name}
          onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
        />
        <select
          data-testid="userlist-filter-role"
          value={filters.role}
          onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
        >
          <option value="">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Standard">Standard</option>
        </select>
        <select
          data-testid="userlist-filter-status"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="actions-bar">
          <Link className="btn-outline" data-testid="userlist-add" to="/admin/users/new">
            + Add User
          </Link>
          <button className="btn-outline" data-testid="userlist-import" onClick={() => fileInputRef.current?.click()}>
            Import
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportFile} />
          <button className="btn-outline" data-testid="userlist-export" onClick={handleExport}>
            Export
          </button>
          <button
            className="btn-outline"
            data-testid="userlist-deactivate"
            disabled={!selected.size}
            onClick={handleBulkDeactivate}
          >
            Bulk Deactivate ({selected.size})
          </button>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  data-testid="userlist-selectall"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
                />
              </th>
              <th>Name</th>
              <th>Role(s)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={5} />
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">
                  No users match current filters.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row, i) => {
                const isSelf = session?.id === row.id;
                return (
                  <tr key={row.id} data-testid={`userlist-row-${i}`}>
                    <td>
                      <input
                        type="checkbox"
                        data-testid={`userlist-row-${i}-select`}
                        checked={selected.has(row.id)}
                        disabled={isSelf}
                        onChange={() => toggleSelect(row.id)}
                      />
                    </td>
                    <td>{row.username}</td>
                    <td>{row.roles.join(', ')}</td>
                    <td>{row.isLocked ? 'Locked' : row.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link
                          className="btn-outline"
                          data-testid={`userlist-row-${i}-edit`}
                          to={`/admin/users/${row.id}`}
                        >
                          Edit
                        </Link>
                        {row.isActive ? (
                          <button
                            className="btn-outline"
                            data-testid={`userlist-row-${i}-deactivate`}
                            disabled={isSelf}
                            title={isSelf ? 'You cannot deactivate your own account.' : undefined}
                            onClick={() => handleStatusChange(row, 'inactive')}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn-outline"
                            data-testid={`userlist-row-${i}-activate`}
                            onClick={() => handleStatusChange(row, 'active')}
                          >
                            Activate
                          </button>
                        )}
                        {row.isLocked && (
                          <button
                            className="btn-outline"
                            data-testid={`userlist-row-${i}-unlock`}
                            onClick={() => handleUnlock(row)}
                          >
                            Unlock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}
