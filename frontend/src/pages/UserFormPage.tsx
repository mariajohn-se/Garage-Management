import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import { userApi } from '../api/userApi';
import { Role } from '../api/authApi';
import { ApiError } from '../api/client';
import { validatePasswordPolicy } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

export function UserFormPage() {
  const { userId } = useParams();
  const isEdit = Boolean(userId);
  const navigate = useNavigate();
  const { session } = useAuth();

  const [username, setUsername] = useState('');
  const [roles, setRoles] = useState<Role[]>(['Standard']);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(!isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const isSelf = isEdit && session?.id === Number(userId);

  useEffect(() => {
    if (!isEdit) return;
    userApi
      .list({})
      .then((users) => {
        const found = users.find((u) => u.id === Number(userId));
        if (found) {
          setUsername(found.username);
          setRoles(found.roles);
          setStatus(found.isActive ? 'active' : 'inactive');
        }
      })
      .finally(() => setLoading(false));
  }, [userId, isEdit]);

  function toggleRole(role: Role) {
    setRoles((r) => (r.includes(role) ? r.filter((x) => x !== role) : [...r, role]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!username.trim()) nextErrors.username = 'Full Name is required.';
    if (!roles.length) nextErrors.roles = 'Select at least one role.';
    if (!isEdit || changePassword) {
      const policyError = validatePasswordPolicy(password);
      if (policyError) nextErrors.password = policyError;
      if (password !== confirmPassword) nextErrors.confirm = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await userApi.update(Number(userId), { status, roles: isSelf ? undefined : roles });
        if (changePassword) await userApi.adminResetPassword(Number(userId), password);
      } else {
        await userApi.create({ username: username.trim(), password, roles });
      }
      navigate('/admin/users');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save user. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 560 }}>
      <h2>{isEdit ? 'Edit User' : 'New User'}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form data-testid="userform-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="userform-fullname">Username</label>
          <input
            id="userform-fullname"
            data-testid="userform-fullname"
            className={`form-input${errors.username ? ' has-error' : ''}`}
            placeholder="As it will appear on reports"
            value={username}
            disabled={isEdit || saving}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <div className="field-error">{errors.username}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="userform-roles">Roles</label>
          <div id="userform-roles" data-testid="userform-roles" style={{ display: 'flex', gap: 'var(--space-4)' }}>
            {(['Standard', 'Administrator'] as Role[]).map((r) => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <input type="checkbox" checked={roles.includes(r)} disabled={isSelf} onChange={() => toggleRole(r)} />
                {r}
              </label>
            ))}
          </div>
          {isSelf && (
            <div className="field-error" style={{ color: 'var(--color-text-muted)' }}>
              You cannot change your own role.
            </div>
          )}
          {errors.roles && <div className="field-error">{errors.roles}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="userform-status">Status</label>
          <select
            id="userform-status"
            data-testid="userform-status"
            className="form-input"
            value={status}
            disabled={isSelf}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {isEdit && (
          <div className="form-group">
            <label>
              <input type="checkbox" checked={changePassword} onChange={(e) => setChangePassword(e.target.checked)} />{' '}
              Change password
            </label>
          </div>
        )}

        {(!isEdit || changePassword) && (
          <>
            <div className="form-group">
              <label htmlFor="userform-password">Password</label>
              <PasswordInput
                id="userform-password"
                data-testid="userform-password"
                className={`form-input${errors.password ? ' has-error' : ''}`}
                placeholder="Leave blank to keep existing"
                value={password}
                disabled={saving}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="userform-confirm">Confirm Password</label>
              <PasswordInput
                id="userform-confirm"
                data-testid="userform-confirm"
                className={`form-input${errors.confirm ? ' has-error' : ''}`}
                value={confirmPassword}
                disabled={saving}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirm && <div className="field-error">{errors.confirm}</div>}
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" data-testid="userform-save" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save User
          </button>
          <button
            type="button"
            data-testid="userform-cancel"
            className="btn-secondary"
            disabled={saving}
            onClick={() => navigate('/admin/users')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
