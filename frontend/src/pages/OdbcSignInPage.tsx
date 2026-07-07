import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import { authApi } from '../api/authApi';
import { ApiError, setTokens } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function OdbcSignInPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connectionString, setConnectionString] = useState('');
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await authApi.odbcTestConnection(connectionString);
      setTestResult({ ok: result.success, message: result.message });
    } catch (err) {
      setTestResult({
        ok: false,
        message:
          err instanceof ApiError
            ? err.message
            : 'Could not connect to ODBC source. Check credentials and connection string.'
      });
    } finally {
      setTesting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);
    setLoading(true);
    try {
      const result = await authApi.odbcLogin(username, password);
      setTokens(result.token, result.refreshToken);
      await refreshSession();
      navigate('/home');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to contact ODBC source.');
    } finally {
      setLoading(false);
    }
  }

  const canLogin = Boolean(username && password && testResult?.ok);

  return (
    <div className="auth-page">
      <div className="glass-form-card">
        <h1 className="form-title">ODBC Sign In</h1>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form data-testid="odbc-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="odbc-username">ODBC Username</label>
            <input
              id="odbc-username"
              data-testid="odbc-username"
              className="form-input"
              placeholder="ODBC User"
              value={username}
              disabled={loading}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="odbc-password">ODBC Password</label>
            <PasswordInput
              id="odbc-password"
              data-testid="odbc-password"
              toggleTestId="odbc-showpw"
              className="form-input"
              placeholder="ODBC Password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="odbc-connstr">Connection String</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="odbc-connstr"
                data-testid="odbc-connstr"
                className={`form-input${testResult && !testResult.ok ? ' has-error' : ''}`}
                placeholder="ODBC DSN/Connection"
                value={connectionString}
                disabled={loading}
                onChange={(e) => {
                  setConnectionString(e.target.value);
                  setTestResult(null);
                }}
              />
              <button
                type="button"
                data-testid="odbc-testconn"
                className="btn-outline"
                disabled={!connectionString || testing}
                onClick={handleTestConnection}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            {testResult && (
              <div
                data-testid="odbc-testconn-result"
                className="field-error"
                style={{ color: testResult.ok ? 'var(--color-success)' : 'var(--color-error)' }}
              >
                {testResult.ok ? 'Connection succeeded.' : testResult.message}
              </div>
            )}
          </div>

          <button type="submit" data-testid="odbc-login" className="btn-primary" disabled={loading || !canLogin}>
            {loading && <span className="spinner" />}
            Log In
          </button>
          <div style={{ height: 'var(--space-3)' }} />
          <button
            type="button"
            data-testid="odbc-cancel"
            className="btn-secondary"
            disabled={loading}
            onClick={() => navigate('/sign-in')}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
