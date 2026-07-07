import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { receiptsPaymentsApi, BillAllocation } from '../api/receiptsPaymentsApi';
import { ApiError } from '../api/client';

export function BillAllocationsPage() {
  const { bill } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<BillAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    receiptsPaymentsApi
      .getBillAllocations(bill ?? '')
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load allocations.'))
      .finally(() => setLoading(false));
  }, [bill]);

  const total = items.reduce((sum, a) => sum + (a.receiptAmount ?? 0), 0);

  return (
    <div className="section-card">
      <h2>Allocations for Bill {bill}</h2>

      {loading && <div className="empty-state">Loading...</div>}
      {error && <div className="error-state">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state">No receipt/payment allocations found for this bill.</div>
      )}
      {!loading && !error && items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Ref No</th>
              <th>Voucher</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                <td>{a.refNo ?? '—'}</td>
                <td>{a.vsrl ?? '—'}</td>
                <td>{a.receiptAmount ?? 0}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>
                <strong>Total Allocated</strong>
              </td>
              <td>
                <strong>{total}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      <div style={{ marginTop: 'var(--space-5)' }}>
        <button className="btn-outline" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
}
