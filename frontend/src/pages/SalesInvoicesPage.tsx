import { useEffect, useState } from 'react';
import { salesApi, SalesInvoice } from '../api/salesApi';
import { Pagination } from '../components/Pagination';

export function SalesInvoicesPage() {
  const [items, setItems] = useState<SalesInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    salesApi
      .invoices({ customerName, page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load sales invoices. Please try again.'))
      .finally(() => setLoading(false));
  }, [customerName, page, limit]);

  return (
    <div className="section-card">
      <h2>Sales Invoices</h2>

      <div className="filter-bar">
        <input
          placeholder="Search customer..."
          value={customerName}
          onChange={(e) => {
            setPage(1);
            setCustomerName(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Total</th>
                <th>Delivered</th>
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
                    No sales invoices found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((s) => (
                  <tr key={s.id}>
                    <td>{s.bill ?? '—'}</td>
                    <td>{s.ordr ?? '—'}</td>
                    <td>{s.customerName ?? '—'}</td>
                    <td>{s.vehNo ?? '—'}</td>
                    <td>{s.billDate ? new Date(s.billDate).toLocaleDateString() : '—'}</td>
                    <td>{s.net ?? s.total ?? '—'}</td>
                    <td>{s.delivered ? 'Yes' : 'No'}</td>
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
