import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { estimationApi } from '../api/jobApi';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function EstimationDetailPage() {
  const { estimationId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const canApprove = session?.roles.some((r) => r === 'Supervisor' || r === 'Administrator');

  const [estimation, setEstimation] = useState<Awaited<ReturnType<typeof estimationApi.get>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [banner, setBanner] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    estimationApi
      .get(Number(estimationId))
      .then(setEstimation)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load estimation.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [estimationId]);

  async function handleDecision(approved: boolean) {
    if (!approved && !comment.trim()) {
      setError('A comment is required when rejecting an estimation.');
      return;
    }
    setActing(true);
    setError(null);
    setBanner(null);
    try {
      await estimationApi.approve(Number(estimationId), approved, comment.trim() || undefined);
      setBanner(approved ? 'Estimation approved.' : 'Estimation rejected.');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to record decision.');
    } finally {
      setActing(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;
  if (error && !estimation) return <div className="section-card error-state">{error}</div>;
  if (!estimation) return null;

  return (
    <div className="section-card" style={{ maxWidth: 700 }}>
      <h2>Estimation {estimation.jobCardNo}</h2>
      {banner && <div className="alert alert-success">{banner}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <table className="data-table">
        <tbody>
          <tr>
            <td>Customer</td>
            <td data-testid="estimation-customer">{estimation.customerName ?? '—'}</td>
          </tr>
          <tr>
            <td>Vehicle</td>
            <td data-testid="estimation-vehicle">{estimation.vehNo ?? '—'}</td>
          </tr>
          <tr>
            <td>Advisor</td>
            <td>{estimation.staffName ?? '—'}</td>
          </tr>
          <tr>
            <td>Total</td>
            <td>{estimation.net ?? estimation.total ?? '—'}</td>
          </tr>
          <tr>
            <td>Labour</td>
            <td>{estimation.labourTotal ?? '—'}</td>
          </tr>
          <tr>
            <td data-testid="estimation-description">Remarks</td>
            <td>{estimation.remarks || '—'}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{estimation.approved ? 'Approved' : 'Pending Approval'}</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>Line Items</h3>
      <table className="data-table" data-testid="estimation-item-table">
        <tbody>
          {estimation.lines.length === 0 && (
            <tr>
              <td className="empty-state">No line item detail available.</td>
            </tr>
          )}
          {estimation.lines.map((line, i) => (
            <tr key={i}>
              <td>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 'var(--text-xs-size)' }}>
                  {JSON.stringify(line)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {canApprove && !estimation.approved && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <div className="form-group">
            <label htmlFor="est-approval-comment">Comment (required to reject)</label>
            <input
              id="est-approval-comment"
              data-testid="est-approval-comment"
              className="form-input"
              value={comment}
              disabled={acting}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              className="btn-primary"
              data-testid="est-approval-approve-btn"
              disabled={acting}
              onClick={() => handleDecision(true)}
            >
              Approve
            </button>
            <button
              className="btn-secondary"
              data-testid="est-approval-reject-btn"
              disabled={acting}
              onClick={() => handleDecision(false)}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-5)' }}>
        <button className="btn-outline" onClick={() => navigate('/estimations')}>
          Back to List
        </button>
      </div>
    </div>
  );
}
