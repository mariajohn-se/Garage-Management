import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { PasswordInput } from '../components/PasswordInput';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../api/client';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Incorrect username or password.',
  ACCOUNT_LOCKED: 'Account is locked due to multiple failed sign-in attempts.',
  ACCOUNT_DISABLED: 'Account is inactive. Contact your administrator.',
  NETWORK_ERROR: 'Unable to contact authentication server. Please try again.'
};

export function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!username.trim()) errors.username = 'Please enter your username or email.';
    if (!password) errors.password = 'Please enter your password.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setApiError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/home');
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setApiError(ERROR_MESSAGES[code] ?? (err instanceof ApiError ? err.message : ERROR_MESSAGES.NETWORK_ERROR));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="glass-form-card">
        <BrandHeader />
        <h1 className="form-title">Sign In</h1>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form data-testid="sign-in-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              data-testid="sign-in-username"
              className={`form-input${fieldErrors.username ? ' has-error' : ''}`}
              placeholder="Your username or email"
              value={username}
              disabled={loading}
              onChange={(e) => setUsername(e.target.value)}
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            />
            {fieldErrors.username && (
              <div id="username-error" className="field-error">
                {fieldErrors.username}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              data-testid="sign-in-password"
              toggleTestId="sign-in-showpw"
              className={`form-input${fieldErrors.password ? ' has-error' : ''}`}
              placeholder="Your password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <div id="password-error" className="field-error">
                {fieldErrors.password}
              </div>
            )}
          </div>

          <div className="form-row-between">
            <span />
            <Link to="/forgot-password" data-testid="sign-in-forgotpw" className="btn-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            data-testid="sign-in-submit"
            className="btn-primary"
            disabled={loading || !username || !password}
          >
            {loading && <span className="spinner" data-testid="sign-in-submit-loading" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
