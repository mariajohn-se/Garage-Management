import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { insuranceInvoiceApi, InsuranceInvoiceListItem } from '../api/insuranceInvoiceApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function InsuranceInvoiceListPage() {
  const [items, setItems] = useState<InsuranceInvoiceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    insuranceInvoiceApi
      .list({ page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load insurance invoices. Please try again.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Insurance Invoices</h2>
        <Link className="btn-primary" style={{ width: 'auto' }} to="/insurance-invoices/new">
          New Insurance Invoice
        </Link>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Estimation #</th>
                <th>Sales Bill #</th>
                <th>Insurer / Customer</th>
                <th>Claim #</th>
                <th>Excess</th>
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
                    No insurance invoices found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((n) => (
                  <tr key={n.id}>
                    <td>{n.billNo ?? '—'}</td>
                    <td>{n.invoiceDt ? new Date(n.invoiceDt).toLocaleDateString() : '—'}</td>
                    <td>{n.estimationNo ?? '—'}</td>
                    <td>{n.internalInvNo ?? '—'}</td>
                    <td>{n.customerName ?? '—'}</td>
                    <td>{n.claimNumber ?? '—'}</td>
                    <td>{n.excessAmount ?? 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
