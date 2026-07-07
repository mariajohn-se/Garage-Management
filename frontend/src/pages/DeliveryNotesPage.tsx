import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesApi, DeliveryNote } from '../api/salesApi';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function DeliveryNotesPage() {
  const [items, setItems] = useState<DeliveryNote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ordr, setOrdr] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    salesApi
      .deliveryNotes({ ordr, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load delivery notes. Please try again.'))
      .finally(() => setLoading(false));
  }, [ordr, page]);

  return (
    <div className="section-card">
      <h2>Delivery Notes</h2>

      <div className="filter-bar">
        <input
          placeholder="Order #..."
          value={ordr}
          onChange={(e) => {
            setPage(1);
            setOrdr(e.target.value);
          }}
        />
        <div className="actions-bar">
          <Link className="btn-primary" to="/delivery-notes/new">
            + New Delivery Note
          </Link>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>DO #</th>
                <th>Order #</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={6} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No delivery notes found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((d) => (
                  <tr key={d.id}>
                    <td>{d.doNo ?? '—'}</td>
                    <td>{d.ordr ?? '—'}</td>
                    <td>{d.customerName ?? '—'}</td>
                    <td>{d.vehNo ?? '—'}</td>
                    <td>{d.doDate ? new Date(d.doDate).toLocaleDateString() : '—'}</td>
                    <td>{d.net ?? d.total ?? '—'}</td>
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
