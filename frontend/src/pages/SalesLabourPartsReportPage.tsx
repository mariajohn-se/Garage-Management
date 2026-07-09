import { useState } from 'react';
import { salesApi } from '../api/salesApi';
import { ApiError } from '../api/client';

interface Row {
  Bill: string;
  BillDt: string;
  Ordr: string;
  CustName: string;
  Vehno: string | null;
  Make: string | null;
  LabourTotal: number | null;
  PartsTotal: number | null;
  Nett: number;
  StaffName: string | null;
}

export function SalesLabourPartsReportPage() {
  const [fromDate, setFromDate] = useState('2011-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setRows((await salesApi.salesLabourPartsReport(fromDate, toDate)) as unknown as Row[]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load the sales labour & parts report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Sales Labour &amp; Parts Report</h2>
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
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Make</th>
              <th>Labour</th>
              <th>Parts</th>
              <th>Net</th>
              <th>Staff</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 1000).map((r, i) => (
              <tr key={i}>
                <td>{r.Bill}</td>
                <td>{r.BillDt ? new Date(r.BillDt).toLocaleDateString() : '—'}</td>
                <td>{r.CustName}</td>
                <td>{r.Vehno ?? '—'}</td>
                <td>{r.Make ?? '—'}</td>
                <td>{r.LabourTotal ?? 0}</td>
                <td>{r.PartsTotal ?? 0}</td>
                <td>{r.Nett}</td>
                <td>{r.StaffName ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rows && rows.length > 1000 && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
          Showing first 1000 of {rows.length} rows.
        </p>
      )}
    </div>
  );
}
