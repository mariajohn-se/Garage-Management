import { useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, SalesOrder } from '../api/salesApi';
import { ApiError } from '../api/client';

export function OrderHelpPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      setResults(await orderApi.help(query.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to search orders.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card" data-testid="documenthelp-table">
      <h2>Order Lookup</h2>
      <div className="filter-bar">
        <input
          placeholder="Search order # or customer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-primary" onClick={handleSearch} disabled={!query.trim()}>
          Search
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {loading && <div className="empty-state">Searching...</div>}
      {!loading && searched && !error && results.length === 0 && (
        <div className="empty-state">No matching orders found.</div>
      )}
      {!loading && results.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((o) => (
              <tr key={o.id}>
                <td>{o.ordr}</td>
                <td>{o.customerName ?? '—'}</td>
                <td>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '—'}</td>
                <td>{o.jobStatus ?? '—'}</td>
                <td>{o.net ?? o.total ?? '—'}</td>
                <td>
                  <Link className="btn-outline" to={`/orders/${o.id}`}>
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
