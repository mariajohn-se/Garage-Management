import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { purchaseApi, PurchaseDeliveryOrderDetail } from '../api/purchaseApi';
import { ApiError } from '../api/client';

export function PurchaseDeliveryOrderDetailPage() {
  const { deliveryOrderNo } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<PurchaseDeliveryOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    purchaseApi
      .getDeliveryOrder(Number(deliveryOrderNo))
      .then(setDetail)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load delivery order.'))
      .finally(() => setLoading(false));
  }, [deliveryOrderNo]);

  if (loading) return <div className="section-card empty-state">Loading...</div>;
  if (error || !detail) return <div className="section-card error-state">{error ?? 'Not found.'}</div>;

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>Purchase Delivery Order {detail.pdoNo}</h2>

      <table className="data-table">
        <tbody>
          <tr>
            <td>Supplier</td>
            <td>{detail.supplierName ?? '—'}</td>
          </tr>
          <tr>
            <td>Order Date</td>
            <td>{detail.orderDate ? new Date(detail.orderDate).toLocaleDateString() : '—'}</td>
          </tr>
          <tr>
            <td>Total</td>
            <td>{detail.net ?? detail.total ?? '—'}</td>
          </tr>
          <tr>
            <td>Closed</td>
            <td>{detail.closed ? 'Yes' : 'No'}</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>Line Items</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {detail.items.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-state">
                No line items found.
              </td>
            </tr>
          )}
          {detail.items.map((item) => (
            <tr key={item.id + (item.itemCode ?? '')}>
              <td>{item.itemCode ?? '—'}</td>
              <td>{item.description ?? '—'}</td>
              <td>{item.qty ?? '—'}</td>
              <td>{item.rate ?? '—'}</td>
              <td>{item.amount ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <button className="btn-outline" onClick={() => navigate('/purchases/delivery-orders')}>
          Back to List
        </button>
      </div>
    </div>
  );
}
