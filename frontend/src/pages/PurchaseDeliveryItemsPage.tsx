import { useEffect, useState } from 'react';
import { purchaseApi, PurchaseDeliveryItem } from '../api/purchaseApi';
import { Pagination } from '../components/Pagination';

export function PurchaseDeliveryItemsPage() {
  const [items, setItems] = useState<PurchaseDeliveryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [itemCode, setItemCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    purchaseApi
      .listDeliveryItems({ itemCode, page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load the purchase order item register. Please try again.'))
      .finally(() => setLoading(false));
  }, [itemCode, page, limit]);

  return (
    <div className="section-card">
      <h2>Purchase Order Item Register</h2>

      <div className="filter-bar">
        <input
          placeholder="Item code..."
          value={itemCode}
          onChange={(e) => {
            setPage(1);
            setItemCode(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>DO #</th>
                <th>Date</th>
                <th>Item</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
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
                    No items found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.pdoNo ?? '—'}</td>
                    <td>{i.date ? new Date(i.date).toLocaleDateString() : '—'}</td>
                    <td>{i.itemCode ?? '—'}</td>
                    <td>{i.description ?? '—'}</td>
                    <td>{i.qty ?? '—'}</td>
                    <td>{i.rate ?? '—'}</td>
                    <td>{i.amount ?? '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}
