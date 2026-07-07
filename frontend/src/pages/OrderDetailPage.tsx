import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { orderApi, SalesOrder } from '../api/salesApi';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const canManage = session?.roles.some((r) => r === 'Supervisor' || r === 'Administrator');

  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    orderApi
      .get(Number(orderId))
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load order.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleDelete() {
    setBanner(null);
    setError(null);
    try {
      await orderApi.remove(Number(orderId));
      navigate('/orders');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to delete order.');
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;
  if (error && !order) return <div className="section-card error-state">{error}</div>;
  if (!order) return null;

  return (
    <div className="section-card" style={{ maxWidth: 700 }}>
      <h2>Order {order.ordr}</h2>
      {banner && <div className="alert alert-success">{banner}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <table className="data-table">
        <tbody>
          <tr>
            <td>Customer</td>
            <td>{order.customerName ?? '—'}</td>
          </tr>
          <tr>
            <td>Vehicle</td>
            <td>{order.vehNo ?? '—'}</td>
          </tr>
          <tr>
            <td>Advisor</td>
            <td>{order.staffName ?? '—'}</td>
          </tr>
          <tr>
            <td>Order Date</td>
            <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{order.jobStatus ?? '—'}</td>
          </tr>
          <tr>
            <td>Total</td>
            <td>{order.net ?? order.total ?? '—'}</td>
          </tr>
          <tr>
            <td>Delivered</td>
            <td>{order.delivered ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Invoiced</td>
            <td>{order.invoiced ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Invoice #</td>
            <td>{order.billNo ?? '—'}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
        <button className="btn-outline" onClick={() => navigate('/orders')}>
          Back to List
        </button>
        <Link className="btn-outline" to={`/orders/${orderId}/edit`}>
          Edit Order
        </Link>
        {canManage && (
          <>
            <Link className="btn-outline" to={`/orders/${orderId}/change-customer`}>
              Change Customer
            </Link>
            <button className="btn-secondary" onClick={handleDelete}>
              Delete Order
            </button>
          </>
        )}
      </div>
    </div>
  );
}
