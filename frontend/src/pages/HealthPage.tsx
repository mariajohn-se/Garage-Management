import { useEffect, useState } from 'react';
import { authApi } from '../api/authApi';

interface HealthState {
  status: string;
  db: string;
  time: string;
}

export function HealthPage() {
  const [health, setHealth] = useState<HealthState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .health()
      .then(setHealth)
      .catch(() => setError('Unable to reach the backend API.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-card" data-testid="health-page">
      <h2>System Health</h2>
      {loading && <div className="empty-state">Checking system status...</div>}
      {error && <div className="error-state">{error}</div>}
      {health && (
        <table className="data-table">
          <tbody>
            <tr>
              <td>Client → API</td>
              <td>Connected</td>
            </tr>
            <tr>
              <td>API Status</td>
              <td style={{ color: health.status === 'ok' ? 'var(--color-success)' : 'var(--color-error)' }}>
                {health.status}
              </td>
            </tr>
            <tr>
              <td>Database</td>
              <td style={{ color: health.db === 'ok' ? 'var(--color-success)' : 'var(--color-error)' }}>{health.db}</td>
            </tr>
            <tr>
              <td>Server Time</td>
              <td>{new Date(health.time).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
