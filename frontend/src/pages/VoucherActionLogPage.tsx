import { useEffect, useState } from 'react';
import { bankingApi, VoucherActionLogItem } from '../api/bankingApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function VoucherActionLogPage() {
  const [items, setItems] = useState<VoucherActionLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [vsrl, setVsrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    bankingApi
      .voucherActionLog({ vsrl: vsrl || undefined, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load the voucher action log. Please try again.'))
      .finally(() => setLoading(false));
  }, [vsrl, page]);

  return (
    <div className="section-card">
      <h2>Voucher Action Log</h2>

      <div className="filter-bar">
        <input
          placeholder="Filter by voucher (VSRL)..."
          value={vsrl}
          onChange={(e) => {
            setPage(1);
            setVsrl(e.target.value);
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
                <th>User</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={5} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No action log entries found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((a) => (
                  <tr key={a.id}>
                    <td>{a.vsrl ?? '—'}</td>
                    <td>{a.userId ?? '—'}</td>
                    <td>{a.date ? new Date(a.date).toLocaleString() : '—'}</td>
                    <td>{a.status ?? '—'}</td>
                    <td>{a.remarks ?? '—'}</td>
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
