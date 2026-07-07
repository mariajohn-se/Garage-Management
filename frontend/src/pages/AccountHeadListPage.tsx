import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ledgerApi, AccountHead } from '../api/ledgerApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function AccountHeadListPage() {
  const [items, setItems] = useState<AccountHead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    ledgerApi
      .listAccountHeads({ search: search || undefined, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load account heads. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="section-card">
      <h2>Account Heads</h2>

      <div className="filter-bar">
        <input
          placeholder="Search by code or description..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Group</th>
                <th>Bank</th>
                <th>Customer</th>
                <th>Supplier</th>
                <th>Locked</th>
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
                    No account heads found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((a) => (
                  <tr key={a.codes}>
                    <td>{a.codes}</td>
                    <td>{a.description ?? '—'}</td>
                    <td>{a.groupDescription ?? '—'}</td>
                    <td>{a.bank ? 'Yes' : 'No'}</td>
                    <td>{a.customer ? 'Yes' : 'No'}</td>
                    <td>{a.supplier ? 'Yes' : 'No'}</td>
                    <td>{a.locked ? 'Yes' : 'No'}</td>
                    <td>
                      <Link className="btn-outline" to={`/ledger/account-heads/${encodeURIComponent(a.codes)}`}>
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
