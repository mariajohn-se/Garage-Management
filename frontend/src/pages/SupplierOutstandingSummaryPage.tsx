import { useEffect, useState } from 'react';
import { receiptsPaymentsApi, SupplierOutstandingRow } from '../api/receiptsPaymentsApi';
import { ApiError } from '../api/client';

export function SupplierOutstandingSummaryPage() {
  const [rows, setRows] = useState<SupplierOutstandingRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    receiptsPaymentsApi
      .supplierOutstandingSummary()
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load supplier outstanding summary.'))
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = rows?.reduce((sum, r) => sum + (r.billBalance ?? 0), 0) ?? 0;

  return (
    <div className="section-card">
      <h2>Supplier Outstanding Summary</h2>

      {error && <div className="error-state">{error}</div>}

      {rows && (
        <div
          style={{
            margin: 'var(--space-4) 0',
            padding: 'var(--space-4)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <strong>Suppliers:</strong> {rows.length} &nbsp;&nbsp; <strong>Total outstanding:</strong>{' '}
          {totalBalance.toFixed(2)}
        </div>
      )}

      {loading &&
        Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-row" style={{ height: 32 }} />)}

      {rows && rows.length === 0 && <div className="empty-state">No suppliers found.</div>}
      {rows && rows.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Phone</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Ledger Balance</th>
              <th>Paid</th>
              <th>Bill Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.suppId}>
                <td>{r.suppName ?? '—'}</td>
                <td>{r.phone ?? '—'}</td>
                <td>{r.debit ?? 0}</td>
                <td>{r.credit ?? 0}</td>
                <td>{r.ledgerBalance ?? 0}</td>
                <td>{r.paidAmount ?? 0}</td>
                <td>{r.billBalance ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
