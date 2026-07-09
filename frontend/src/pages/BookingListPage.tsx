import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi, BookingListItem } from '../api/bookingApi';
import { Pagination } from '../components/Pagination';

export function BookingListPage() {
  const [items, setItems] = useState<BookingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    bookingApi
      .list({ page, limit })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load bookings. Please try again.'))
      .finally(() => setLoading(false));
  }, [page, limit]);

  return (
    <div className="section-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Vehicle Bookings</h2>
        <Link className="btn-primary" style={{ width: 'auto' }} to="/bookings/new">
          New Booking
        </Link>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Booked On</th>
                <th>Appointment</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Make</th>
                <th>Advisor</th>
                <th>Remarks</th>
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
                    No bookings found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bookDt ? new Date(b.bookDt).toLocaleDateString() : '—'}</td>
                    <td>{b.appDate ? new Date(b.appDate).toLocaleString() : '—'}</td>
                    <td>{b.custName ?? '—'}</td>
                    <td>{b.vehNo ?? '—'}</td>
                    <td>{b.make ?? '—'}</td>
                    <td>{b.staffName ?? '—'}</td>
                    <td>{b.remarks ?? '—'}</td>
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
