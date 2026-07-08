import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bankingApi, VoucherListItem } from '../api/bankingApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function VoucherListPage() {
  const [items, setItems] = useState<VoucherListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [vtype, setVtype] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    bankingApi
      .listVouchers({ vtype: vtype || undefined, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load vouchers. Please try again.'))
      .finally(() => setLoading(false));
  }, [vtype, page]);

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h2>Vouchers</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link className="btn-outline" to="/banking/vouchers/new/receipt">
            New Receipt
          </Link>
          <Link className="btn-outline" to="/banking/vouchers/new/payment">
            New Payment
          </Link>
          <Link className="btn-primary" style={{ width: 'auto' }} to="/ledger/journal-vouchers/new">
            New Journal Voucher
          </Link>
        </div>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Filter by voucher type (e.g. Receipt, Payment, Sales)..."
          value={vtype}
          onChange={(e) => {
            setPage(1);
            setVtype(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>VSRL</th>
                <th>Date</th>
                <th>Type</th>
                <th>Pay Type</th>
                <th>Account</th>
                <th>Ref No</th>
                <th>Checked</th>
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
                    No vouchers found.
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
                    <td>{v.refNo ?? '—'}</td>
                    <td>{v.checked ? 'Yes' : 'No'}</td>
                    <td>
                      <Link
                        className="btn-outline"
                        to={`/banking/vouchers/${v.id}?vsrl=${encodeURIComponent(v.vsrl ?? '')}`}
                      >
                        View
                      </Link>
                    </td>
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
