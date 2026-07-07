import { useEffect, useState } from 'react';
import { bankingApi, VoucherVerificationItem } from '../api/bankingApi';
import { ApiError } from '../api/client';

export function VoucherVerificationPage() {
  const [checked, setChecked] = useState(false);
  const [items, setItems] = useState<VoucherVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [actingVsrl, setActingVsrl] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    bankingApi
      .listVerification(checked)
      .then((res) => setItems(res.slice(0, 200)))
      .catch(() => setError('Unable to load voucher verification list.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [checked]);

  async function markVerified(vsrl: string | null) {
    if (!vsrl) return;
    setActingVsrl(vsrl);
    setError(null);
    setBanner(null);
    try {
      await bankingApi.markVerified(vsrl);
      setBanner(`Voucher ${vsrl} marked as verified.`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to mark voucher as verified.');
    } finally {
      setActingVsrl(null);
    }
  }

  return (
    <div className="section-card">
      <h2>Voucher Verification</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>
        The closest real analog in this legacy database to bank reconciliation: vouchers can be marked checked/verified
        per user. Showing the first 200 of the real result set.
      </p>

      <div className="filter-bar">
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          Show already-verified vouchers
        </label>
      </div>

      {banner && <div className="alert alert-success">{banner}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>VSRL</th>
            <th>Date</th>
            <th>Type</th>
            <th>Pay Type</th>
            <th>Account</th>
            <th>Edit Count</th>
            {!checked && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td colSpan={7} />
              </tr>
            ))}
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-state">
                No {checked ? 'verified' : 'unverified'} vouchers found.
              </td>
            </tr>
          )}
          {!loading &&
            items.map((v) => (
              <tr key={v.id}>
                <td>{v.vsrl ?? '—'}</td>
                <td>{v.date ? new Date(v.date).toLocaleDateString() : '—'}</td>
                <td>{v.vtype ?? '—'}</td>
                <td>{v.payType ?? '—'}</td>
                <td>{v.description ?? '—'}</td>
                <td>{v.editCount ?? 0}</td>
                {!checked && (
                  <td>
                    <button
                      className="btn-outline"
                      disabled={actingVsrl === v.vsrl}
                      onClick={() => markVerified(v.vsrl)}
                    >
                      Mark Verified
                    </button>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
