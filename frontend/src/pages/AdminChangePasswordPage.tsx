import { FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import { userApi } from '../api/userApi';
import { validatePasswordPolicy } from '../utils/validators';
import { ApiError } from '../api/client';

export function AdminChangePasswordPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) nextErrors.new = policyError;
    if (confirmPassword !== newPassword) nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setLoading(true);
    try {
      await userApi.adminResetPassword(Number(userId), newPassword);
      setSuccess(true);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 480 }}>
      <h2>Set New Password</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}
      {success && <div className="alert alert-success">Password updated for user {userId}.</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="adminpwchange-new">New Password</label>
          <PasswordInput
            id="adminpwchange-new"
            data-testid="adminpwchange-new"
            className={`form-input${errors.new ? ' has-error' : ''}`}
            value={newPassword}
            disabled={loading}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.new && <div className="field-error">{errors.new}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="adminpwchange-confirm">Confirm New Password</label>
          <PasswordInput
            id="adminpwchange-confirm"
            data-testid="adminpwchange-confirm"
            className={`form-input${errors.confirm ? ' has-error' : ''}`}
            value={confirmPassword}
            disabled={loading}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirm && <div className="field-error">{errors.confirm}</div>}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" data-testid="adminpwchange-set" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            Set New Password
          </button>
          <button
            type="button"
            data-testid="adminpwchange-cancel"
            className="btn-secondary"
            disabled={loading}
            onClick={() => navigate('/admin/users')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
