import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supplierApi, Supplier } from '../api/partyApi';
import { ApiError } from '../api/client';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function SupplierListPage() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    supplierApi
      .list({ ...filters, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load suppliers.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  async function handleExport() {
    try {
      const csv = await supplierApi.exportCsv(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'suppliers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed. Please try again.');
    }
  }

  return (
    <div className="section-card">
      <h2>Suppliers</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        The Active flag's polarity could not be confirmed from production data (see README.md), so status is not shown
        or filterable here.
      </p>

      <div className="filter-bar">
        <input
          data-testid="supp-filter-name"
          placeholder="Search name..."
          value={filters.name}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, name: e.target.value }));
          }}
        />
        <input
          data-testid="supp-filter-phone"
          placeholder="Search phone..."
          value={filters.phone}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, phone: e.target.value }));
          }}
        />
        <div className="actions-bar">
          <Link className="btn-outline" data-testid="supp-add" to="/suppliers/new">
            + New Supplier
          </Link>
          <button className="btn-outline" data-testid="supp-export" onClick={handleExport}>
            Export
          </button>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Area</th>
                <th>Emirate</th>
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
                    No suppliers match current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((s, i) => (
                  <tr key={s.suppId} data-testid={`supp-row-${i}`}>
                    <td>{s.name}</td>
                    <td>{s.phone1 || s.phone2 || '—'}</td>
                    <td>{s.area ?? '—'}</td>
                    <td>{s.emirate ?? '—'}</td>
                    <td>
                      <Link
                        className="btn-outline"
                        data-testid={`supp-row-${i}-edit`}
                        to={`/suppliers/${s.suppId}/edit`}
                      >
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
