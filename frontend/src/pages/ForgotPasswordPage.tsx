import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ApiError } from '../api/client';

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Enter your username or email.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.passwordResetRequest(identifier.trim());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send reset link. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="glass-form-card">
        <h1 className="form-title">Reset Your Password</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {success ? (
          <div data-testid="forgotpw-success-message" className="alert alert-success">
            If the account exists, a password reset link has been sent to your email/SMS.
          </div>
        ) : (
          <form data-testid="forgotpw-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="forgotpw-username">Username or Email</label>
              <input
                id="forgotpw-username"
                data-testid="forgotpw-username"
                className={`form-input${error ? ' has-error' : ''}`}
                placeholder="Registered username or email"
                value={identifier}
                disabled={loading}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <button type="submit" data-testid="forgotpw-submit" className="btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              Send Reset Link
            </button>
          </form>
        )}

        <div style={{ height: 'var(--space-5)' }} />
        <Link to="/sign-in" data-testid="forgotpw-back" className="btn-link">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
