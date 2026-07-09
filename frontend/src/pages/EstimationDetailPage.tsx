import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { estimationApi } from '../api/jobApi';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatMoney } from '../utils/format';

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

  const isLinked = !!estimation.jobCardNo && estimation.jobCardNo !== '0';
  const isPending = !estimation.approved && !estimation.rejected;
  // Fix4/Fix1: Total = parts/materials only, Labour stored separately, Nett = Total + Labour + Add - Less.
  const totalParts = estimation.total ?? 0;
  const totalLabour = estimation.labourTotal ?? 0;
  const addition = estimation.addition ?? 0;
  const less = estimation.less ?? 0;
  const nett = estimation.net ?? totalParts + totalLabour + addition - less;
  // Convert to Job Order: per the legacy schema, Estimation01Sql.Approved is only ever computed
  // when a job card is already linked (Partsavailable01 is keyed by JobCardNo) - the backend's
  // own setApproval() blocks approving an unlinked estimation. In practice this means an
  // Approved estimation almost always already has a real jobCardNo, so this condition is rarely
  // (if ever) true against live data. Implemented as literally specified; flagged for the
  // business owner to confirm the intended real-world sequence.
  const canConvertToJobOrder = estimation.approved && !isLinked;

  return (
    <div className="section-card" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ marginBottom: 'var(--space-1)' }}>Estimation #{estimation.estimationNo ?? estimation.id}</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Job Card: {isLinked ? estimation.jobCardNo : 'Not linked'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link className="btn-outline" to={`/estimations/${estimation.id}/print`} target="_blank">
            Print / PDF
          </Link>
          {estimation.approved ? (
            <button className="btn-outline" disabled title="Approved estimations can no longer be edited.">
              Edit
            </button>
          ) : (
            <Link className="btn-outline" to={`/estimations/${estimation.id}/edit`}>
              Edit
            </Link>
          )}
          {canConvertToJobOrder && (
            <Link
              className="btn-primary"
              style={{ width: 'auto' }}
              to={`/orders/new?estimationId=${estimation.id}&estimationNo=${encodeURIComponent(
                estimation.estimationNo ?? ''
              )}&custId=${encodeURIComponent(estimation.customerId ?? '')}&custName=${encodeURIComponent(
                estimation.customerName ?? ''
              )}&vehId=${estimation.vehicleId ?? ''}`}
            >
              Convert to Job Order
            </Link>
          )}
        </div>
      </div>

      {banner && <div className="alert alert-success">{banner}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <table className="data-table" style={{ marginTop: 'var(--space-4)' }}>
        <tbody>
          <tr>
            <td>Customer</td>
            <td data-testid="estimation-customer">{estimation.customerName ?? '—'}</td>
          </tr>
          <tr>
            <td>Advisor</td>
            <td>{estimation.staffName ?? '—'}</td>
          </tr>
          <tr>
            <td>Estimation Date</td>
            <td>{formatDate(estimation.billDate)}</td>
          </tr>
          <tr>
            <td data-testid="estimation-description">Remarks</td>
            <td>{estimation.remarks || '—'}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{estimation.approved ? 'Approved' : estimation.rejected ? 'Rejected' : 'Pending Approval'}</td>
          </tr>
          {estimation.rejected && estimation.rejectionComment && (
            <tr>
              <td>Rejection Reason</td>
              <td>{estimation.rejectionComment}</td>
            </tr>
          )}
        </tbody>
      </table>

      <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>Vehicle</h3>
      <table className="data-table" data-testid="estimation-vehicle">
        <tbody>
          <tr>
            <td>Registration No.</td>
            <td>{estimation.vehNo ?? '—'}</td>
            <td>Make</td>
            <td>{estimation.make ?? '—'}</td>
          </tr>
          <tr>
            <td>Chassis / Engine No.</td>
            <td>{estimation.engineNo ?? '—'}</td>
            <td>Colour</td>
            <td>{estimation.colour ?? '—'}</td>
          </tr>
          <tr>
            <td>Year</td>
            <td>{estimation.manYear ?? '—'}</td>
            <td style={{ color: 'var(--color-text-secondary)' }}>Vehicle ID</td>
            <td style={{ color: 'var(--color-text-secondary)' }}>{estimation.vehicleId ?? '—'}</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>Line Items</h3>
      <table className="data-table" data-testid="estimation-item-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ textAlign: 'right' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Unit Price</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'right' }}>Labour</th>
            <th style={{ textAlign: 'right' }}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {estimation.lines.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-state">
                No line item detail available.
              </td>
            </tr>
          )}
          {estimation.lines.map((line, i) => {
            const amount = line.amount ?? (line.qty ?? 0) * (line.unitPrice ?? 0);
            const labour = line.labourAmount ?? 0;
            return (
              <tr key={i}>
                <td>{line.description ?? '—'}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{line.qty ?? '—'}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(line.unitPrice)}
                </td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(amount)}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(labour)}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {formatMoney(amount + labour)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <table className="data-table" style={{ marginTop: 'var(--space-4)', maxWidth: 360, marginLeft: 'auto' }}>
        <tbody>
          <tr>
            <td>Total (Parts)</td>
            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(totalParts)}</td>
          </tr>
          <tr>
            <td>Total (Labour)</td>
            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(totalLabour)}</td>
          </tr>
          <tr>
            <td>Add</td>
            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(addition)}</td>
          </tr>
          <tr>
            <td>Less</td>
            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(less)}</td>
          </tr>
          <tr style={{ fontWeight: 700 }}>
            <td>Nett</td>
            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(nett)}</td>
          </tr>
        </tbody>
      </table>

      {canApprove && isPending && !isLinked && (
        <div className="alert alert-error" style={{ marginTop: 'var(--space-6)' }}>
          This estimation is not linked to a job card yet - link it to a job card before it can be approved or
          rejected.
        </div>
      )}

      {canApprove && isPending && isLinked && (
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
