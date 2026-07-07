import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleApi, Vehicle } from '../api/partyApi';
import { ApiError } from '../api/client';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function VehicleListPage() {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    vehicleApi
      .list({ search, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load vehicles.'))
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="section-card">
      <h2>Vehicles</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Vehicles are not linked to customers in the live database (see README.md) - this is a standalone vehicle
        registry rather than a per-customer list.
      </p>

      <div className="filter-bar">
        <input
          data-testid="veh-filter-search"
          placeholder="Search registration, engine no, or make..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <div className="actions-bar">
          <Link className="btn-outline" data-testid="veh-add" to="/vehicles/new">
            + New Vehicle
          </Link>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Make</th>
                <th>Colour</th>
                <th>Year</th>
                <th>Actions</th>
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
                    No vehicles match current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((v, i) => (
                  <tr key={v.vehId} data-testid={`veh-row-${i}`}>
                    <td>{v.vehNo || '—'}</td>
                    <td>{v.make ?? '—'}</td>
                    <td>{v.colour ?? '—'}</td>
                    <td>{v.manYear ?? '—'}</td>
                    <td>
                      <Link className="btn-outline" data-testid={`veh-row-${i}-edit`} to={`/vehicles/${v.vehId}/edit`}>
                        Edit
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
