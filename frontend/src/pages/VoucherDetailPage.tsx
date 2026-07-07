import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { bankingApi, VoucherDetail } from '../api/bankingApi';
import { ApiError } from '../api/client';

export function VoucherDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const vsrl = searchParams.get('vsrl') ?? '';
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState<VoucherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    bankingApi
      .getVoucher(Number(id), vsrl)
      .then(setVoucher)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load voucher.'))
      .finally(() => setLoading(false));
  }, [id, vsrl]);

  if (loading) return <div className="section-card empty-state">Loading...</div>;
  if (error && !voucher) return <div className="section-card error-state">{error}</div>;
  if (!voucher) return null;

  const totalDebit = voucher.lines.reduce((sum, l) => sum + (l.debit ?? 0), 0);
  const totalCredit = voucher.lines.reduce((sum, l) => sum + (l.credit ?? 0), 0);

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>Voucher {voucher.vsrl}</h2>

      <table className="data-table">
        <tbody>
          <tr>
            <td>Date</td>
            <td>{voucher.date ? new Date(voucher.date).toLocaleDateString() : '—'}</td>
          </tr>
          <tr>
            <td>Type</td>
            <td>{voucher.vtype ?? '—'}</td>
          </tr>
          <tr>
            <td>Pay Type</td>
            <td>{voucher.payType ?? '—'}</td>
          </tr>
          <tr>
            <td>Reference No</td>
            <td>{voucher.refNo ?? '—'}</td>
          </tr>
          <tr>
            <td>Narration</td>
            <td>{voucher.narration ?? '—'}</td>
          </tr>
          <tr>
            <td>Checked</td>
            <td>{voucher.checked ? 'Yes' : 'No'}</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>Lines</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          {voucher.lines.length === 0 && (
            <tr>
              <td colSpan={4} className="empty-state">
                No line detail available.
              </td>
            </tr>
          )}
          {voucher.lines.map((l, i) => (
            <tr key={i}>
              <td>{l.ac ?? '—'}</td>
              <td>{l.description ?? '—'}</td>
              <td>{l.debit ?? 0}</td>
              <td>{l.credit ?? 0}</td>
            </tr>
          ))}
        </tbody>
        {voucher.lines.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={2}>
                <strong>Total</strong>
              </td>
              <td>
                <strong>{totalDebit}</strong>
              </td>
              <td>
                <strong>{totalCredit}</strong>
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <button className="btn-outline" onClick={() => navigate('/banking/vouchers')}>
          Back to List
        </button>
      </div>
    </div>
  );
}
