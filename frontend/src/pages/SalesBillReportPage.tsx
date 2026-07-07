import { useState } from 'react';
import { salesApi } from '../api/salesApi';
import { ApiError } from '../api/client';

interface Row {
  Ordr: string;
  Bill: string;
  BillDt: string;
  Nett: number;
  CustName: string;
  Phone1: string;
  StaffName: string;
  PaidAmount: number;
  Balance: number;
}

export function SalesBillReportPage() {
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows((await salesApi.salesBillReport(fromDate, toDate)) as unknown as Row[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the sales bill report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Sales Bill Report</h2>
      <div className="filter-bar">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button className="btn-primary" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />}
          Run Report
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}
      {rows && rows.length === 0 && <div className="empty-state">No data for this date range.</div>}
      {rows && rows.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Bill #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Staff</th>
              <th>Net</th>
              <th>Paid</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.Ordr}</td>
                <td>{r.Bill}</td>
                <td>{r.BillDt ? new Date(r.BillDt).toLocaleDateString() : '—'}</td>
                <td>{r.CustName}</td>
                <td>{r.StaffName ?? '—'}</td>
                <td>{r.Nett}</td>
                <td>{r.PaidAmount}</td>
                <td>{r.Balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
