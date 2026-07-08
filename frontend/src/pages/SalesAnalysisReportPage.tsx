import { useState } from 'react';
import { salesApi } from '../api/salesApi';
import { ApiError } from '../api/client';

interface Row {
  BILL: string;
  BILLDT: string;
  ORDR: string;
  NETT: number;
  CUSTNAME: string;
  PHONE1: string;
  STAFFNAME: string;
  VEHNO: string;
  MAKE: string;
  PAID: number;
}

export function SalesAnalysisReportPage() {
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows((await salesApi.salesAnalysisReport(fromDate, toDate)) as unknown as Row[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the sales analysis report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Sales Analysis</h2>
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
              <th>Bill #</th>
              <th>Date</th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Staff</th>
              <th>Net</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.BILL}</td>
                <td>{r.BILLDT ? new Date(r.BILLDT).toLocaleDateString() : '—'}</td>
                <td>{r.ORDR}</td>
                <td>{r.CUSTNAME}</td>
                <td>{r.VEHNO ?? '—'}</td>
                <td>{r.STAFFNAME ?? '—'}</td>
                <td>{r.NETT}</td>
                <td>{r.PAID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
