import { useEffect, useState } from 'react';
import { purchaseApi, PendingPurchaseDO } from '../api/purchaseApi';

export function PendingPurchaseDOPage() {
  const [items, setItems] = useState<PendingPurchaseDO[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    purchaseApi
      .listPendingDeliveryOrders(supplierId || undefined)
      .then(setItems)
      .catch(() => setError('Unable to load pending delivery orders. Please try again.'))
      .finally(() => setLoading(false));
  }, [supplierId]);

  return (
    <div className="section-card">
      <h2>Pending Purchase Delivery Orders</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Backed by the real, documented <code>PendingPurchaseDO</code> stored procedure.
      </p>

      <div className="filter-bar">
        <input placeholder="Supplier ID..." value={supplierId} onChange={(e) => setSupplierId(e.target.value)} />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>PDO #</th>
              <th>Supplier</th>
              <th>Reference</th>
              <th>Order Date</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={4} />
                </tr>
              ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  No pending delivery orders found.
                </td>
              </tr>
            )}
            {!loading &&
              items.map((p, i) => (
                <tr key={`${p.id}-${i}`}>
                  <td>{p.pdoNo ?? '—'}</td>
                  <td>{p.suppId ?? '—'}</td>
                  <td>{p.ref ?? '—'}</td>
                  <td>{p.porDt ? new Date(p.porDt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
