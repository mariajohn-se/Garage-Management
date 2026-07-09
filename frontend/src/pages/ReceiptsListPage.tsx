import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { receiptsPaymentsApi, PartyBill } from '../api/receiptsPaymentsApi';
import { Pagination } from '../components/Pagination';

export function ReceiptsListPage() {
  const [items, setItems] = useState<PartyBill[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | 'paid' | 'outstanding'>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    receiptsPaymentsApi
      .listReceipts({ search: search || undefined, status: status || undefined, page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load receipts. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, status, page, limit]);

  return (
    <div className="section-card">
      <h2>Receipts</h2>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Customer-side bills from the real customer/supplier bill subledger, with a status derived from the real
        outstanding balance.
      </p>

      <div className="filter-bar">
        <input
          placeholder="Search customer, bill, or ID..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as '' | 'paid' | 'outstanding');
          }}
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="outstanding">Outstanding</option>
        </select>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Received</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={8} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No receipts found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bill ?? '—'}</td>
                    <td>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                    <td>{b.accountName ?? '—'}</td>
                    <td>{b.amount ?? 0}</td>
                    <td>{b.totalReceived ?? 0}</td>
                    <td>{b.balance ?? 0}</td>
                    <td>{b.status}</td>
                    <td>
                      {b.bill && (
                        <Link className="btn-outline" to={`/receipts/allocations/${encodeURIComponent(b.bill)}`}>
                          Allocations
                        </Link>
                      )}
                    </td>
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
