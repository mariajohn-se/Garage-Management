import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { estimationApi } from '../api/jobApi';
import { reportingApi, CompanyHeader } from '../api/reportingApi';
import { ApiError } from '../api/client';
import { formatDate, formatMoney } from '../utils/format';

export function EstimationPrintPage() {
  const { estimationId } = useParams();
  const [estimation, setEstimation] = useState<Awaited<ReturnType<typeof estimationApi.get>> | null>(null);
  const [company, setCompany] = useState<CompanyHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([estimationApi.get(Number(estimationId)), reportingApi.getCompanyHeader().catch(() => null)])
      .then(([est, header]) => {
        setEstimation(est);
        setCompany(header);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load estimation.'))
      .finally(() => setLoading(false));
  }, [estimationId]);

  if (loading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;
  if (error || !estimation) return <div style={{ padding: 'var(--space-6)' }}>{error ?? 'Not found.'}</div>;

  const totalParts = estimation.total ?? 0;
  const totalLabour = estimation.labourTotal ?? 0;
  const addition = estimation.addition ?? 0;
  const less = estimation.less ?? 0;
  const nett = estimation.net ?? totalParts + totalLabour + addition - less;
  const isLinked = !!estimation.jobCardNo && estimation.jobCardNo !== '0';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-6)', color: '#111', background: '#fff' }}>
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          body { background: #fff; }
        }
        .print-page table { width: 100%; border-collapse: collapse; }
        .print-page th, .print-page td { border: 1px solid #ccc; padding: 6px 10px; font-size: 13px; }
        .print-page th { background: #f3f3f3; text-align: left; }
      `}</style>

      <div className="print-hide" style={{ textAlign: 'right', marginBottom: 16 }}>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => window.print()}>
          Print
        </button>
      </div>

      <div className="print-page">
        {/* Letterhead area */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 12, marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>{company?.companyName ?? 'Company Name'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12 }}>
            {[company?.address1, company?.address2, company?.address3].filter(Boolean).join(', ') || '—'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12 }}>
            {[company?.phone1, company?.phone2].filter(Boolean).join(' / ')}
            {company?.email ? ` · ${company.email}` : ''}
          </p>
          <h2 style={{ marginTop: 12, fontSize: 16, textDecoration: 'underline' }}>ESTIMATION</h2>
        </div>

        <table style={{ marginBottom: 16 }}>
          <tbody>
            <tr>
              <td>Estimation #</td>
              <td>{estimation.estimationNo ?? estimation.id}</td>
              <td>Date</td>
              <td>{formatDate(estimation.billDate)}</td>
            </tr>
            <tr>
              <td>Job Card #</td>
              <td>{isLinked ? estimation.jobCardNo : 'Not linked'}</td>
              <td>Advisor</td>
              <td>{estimation.staffName ?? '—'}</td>
            </tr>
            <tr>
              <td>Customer</td>
              <td colSpan={3}>{estimation.customerName ?? '—'}</td>
            </tr>
            <tr>
              <td>Registration No.</td>
              <td>{estimation.vehNo ?? '—'}</td>
              <td>Make / Colour</td>
              <td>
                {estimation.make ?? '—'} / {estimation.colour ?? '—'}
              </td>
            </tr>
            <tr>
              <td>Chassis / Engine No.</td>
              <td>{estimation.engineNo ?? '—'}</td>
              <td>Year</td>
              <td>{estimation.manYear ?? '—'}</td>
            </tr>
          </tbody>
        </table>

        <table style={{ marginBottom: 16 }}>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'right' }}>Labour</th>
              <th style={{ textAlign: 'right' }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {estimation.lines.map((line, i) => {
              const amount = line.amount ?? (line.qty ?? 0) * (line.unitPrice ?? 0);
              const labour = line.labourAmount ?? 0;
              return (
                <tr key={i}>
                  <td>{line.description ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>{line.qty ?? '—'}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(line.unitPrice)}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(amount)}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(labour)}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(amount + labour)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <table style={{ maxWidth: 320, marginLeft: 'auto' }}>
          <tbody>
            <tr>
              <td>Total (Parts)</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(totalParts)}</td>
            </tr>
            <tr>
              <td>Total (Labour)</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(totalLabour)}</td>
            </tr>
            <tr>
              <td>Add</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(addition)}</td>
            </tr>
            <tr>
              <td>Less</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(less)}</td>
            </tr>
            <tr style={{ fontWeight: 700 }}>
              <td>Nett</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(nett)}</td>
            </tr>
          </tbody>
        </table>

        {estimation.remarks && (
          <p style={{ marginTop: 16, fontSize: 13 }}>
            <strong>Remarks:</strong> {estimation.remarks}
          </p>
        )}
      </div>
    </div>
  );
}
