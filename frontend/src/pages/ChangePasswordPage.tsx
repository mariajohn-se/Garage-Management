import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import { validatePasswordPolicy } from '../utils/validators';
import { authApi } from '../api/authApi';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const NETWORK_ERROR_MESSAGE = 'Unable to change password. Please try again.';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!currentPassword) nextErrors.current = 'Please enter your current password.';
    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) nextErrors.new = policyError;
    if (confirmPassword !== newPassword) nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        logout().finally(() => navigate('/sign-in'));
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message || NETWORK_ERROR_MESSAGE);
      } else {
        setApiError(NETWORK_ERROR_MESSAGE);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="glass-form-card">
        <h1 className="form-title">Change Your Password</h1>

        {apiError && <div className="alert alert-error">{apiError}</div>}
        {success && <div className="alert alert-success">Password changed successfully.</div>}

        <form data-testid="pwchange-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="current-password">Current Password</label>
            <PasswordInput
              id="current-password"
              data-testid="pwchange-current"
              toggleTestId="pwchange-showpw-current"
              className={`form-input${errors.current ? ' has-error' : ''}`}
              placeholder="Current password"
              value={currentPassword}
              disabled={loading}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            {errors.current && <div className="field-error">{errors.current}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <PasswordInput
              id="new-password"
              data-testid="pwchange-new"
              toggleTestId="pwchange-showpw-new"
              className={`form-input${errors.new ? ' has-error' : ''}`}
              placeholder="New password"
              value={newPassword}
              disabled={loading}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {errors.new && <div className="field-error">{errors.new}</div>}
            <div className="field-error" style={{ color: 'var(--color-text-muted)' }}>
              Min 10 characters, with uppercase, lowercase, a number, and a special character.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <PasswordInput
              id="confirm-password"
              data-testid="pwchange-confirm"
              toggleTestId="pwchange-showpw-confirm"
              className={`form-input${errors.confirm ? ' has-error' : ''}`}
              placeholder="Re-enter new password"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirm && <div className="field-error">{errors.confirm}</div>}
          </div>

          <button type="submit" data-testid="pwchange-submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            Change Password
          </button>
          <div style={{ height: 'var(--space-3)' }} />
          <button
            type="button"
            data-testid="pwchange-cancel"
            className="btn-secondary"
            disabled={loading}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
