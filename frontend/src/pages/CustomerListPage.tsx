import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi, Customer } from '../api/partyApi';
import { ApiError } from '../api/client';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function CustomerListPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', phone: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    customerApi
      .list({ ...filters, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load customers.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  async function handleExport() {
    try {
      const csv = await customerApi.exportCsv(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed. Please try again.');
    }
  }

  return (
    <div className="section-card">
      <h2>Customers</h2>

      <div className="filter-bar">
        <input
          data-testid="cust-filter-name"
          placeholder="Search name..."
          value={filters.name}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, name: e.target.value }));
          }}
        />
        <input
          data-testid="cust-filter-phone"
          placeholder="Search phone..."
          value={filters.phone}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, phone: e.target.value }));
          }}
        />
        <select
          data-testid="cust-filter-status"
          value={filters.status}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, status: e.target.value }));
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="actions-bar">
          <Link className="btn-outline" data-testid="cust-add" to="/customers/new">
            + New Customer
          </Link>
          <button className="btn-outline" data-testid="cust-export" onClick={handleExport}>
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
                <th>Status</th>
                <th>Actions</th>
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
                    No customers match current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((c, i) => (
                  <tr key={c.custId} data-testid={`cust-row-${i}`}>
                    <td>{c.name}</td>
                    <td>{c.phone1 || c.phone2 || '—'}</td>
                    <td>{c.area ?? '—'}</td>
                    <td>{c.emirate ?? '—'}</td>
                    <td>{c.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <Link
                        className="btn-outline"
                        data-testid={`cust-row-${i}-edit`}
                        to={`/customers/${c.custId}/edit`}
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
