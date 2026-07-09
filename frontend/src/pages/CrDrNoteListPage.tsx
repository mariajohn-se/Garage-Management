import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { crDrNoteApi, CrDrNoteListItem } from '../api/crDrNoteApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function CrDrNoteListPage() {
  const [items, setItems] = useState<CrDrNoteListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    crDrNoteApi
      .list({ page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load credit/debit notes. Please try again.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Credit / Debit Notes</h2>
        <Link className="btn-primary" style={{ width: 'auto' }} to="/cr-dr-notes/new">
          New Note
        </Link>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ref #</th>
                <th>Date</th>
                <th>Type</th>
                <th>Account</th>
                <th>Contra Account</th>
                <th>Amount</th>
                <th>Narration</th>
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
                    No credit/debit notes found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((n) => (
                  <tr key={n.id}>
                    <td>{n.refNo ?? '—'}</td>
                    <td>{n.refDt ? new Date(n.refDt).toLocaleDateString() : '—'}</td>
                    <td>{n.type ?? '—'}</td>
                    <td>{n.acName ?? n.ac ?? '—'}</td>
                    <td>{n.vacName ?? n.vac ?? '—'}</td>
                    <td>{n.amount ?? 0}</td>
                    <td>{n.narration ?? '—'}</td>
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
