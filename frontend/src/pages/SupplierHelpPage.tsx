import { useState } from 'react';
import { supplierApi, Supplier } from '../api/partyApi';
import { ApiError } from '../api/client';

export function SupplierHelpPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      setResults(await supplierApi.help(query.trim()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to search suppliers.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card" data-testid="supphelp-panel">
      <h2>Supplier Lookup</h2>
      <div className="filter-bar">
        <input
          data-testid="supphelp-search"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn-primary" data-testid="supphelp-submit" onClick={handleSearch} disabled={!query.trim()}>
          Search
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {loading && <div className="empty-state">Searching...</div>}
      {!loading && searched && !error && results.length === 0 && (
        <div className="empty-state">No matching suppliers found.</div>
      )}
      {!loading && results.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Area</th>
            </tr>
          </thead>
          <tbody>
            {results.map((s) => (
              <tr key={s.suppId} data-testid={`supphelp-row-${s.suppId}`}>
                <td>{s.name}</td>
                <td>{s.phone1 || s.phone2 || '—'}</td>
                <td>{s.area ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
