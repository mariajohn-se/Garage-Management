import { useEffect, useState } from 'react';
import { reportingApi, CompanyHeader } from '../api/reportingApi';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function CompanyHeaderPage() {
  const { session } = useAuth();
  const isAdmin = session?.roles.includes('Administrator');

  const [header, setHeader] = useState<CompanyHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [address1, setAddress1] = useState('');
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    reportingApi
      .getCompanyHeader()
      .then((h) => {
        setHeader(h);
        setCompanyName(h.companyName ?? '');
        setAddress1(h.address1 ?? '');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load company header.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setBanner(null);
    try {
      await reportingApi.updateCompanyHeader({ companyName: companyName.trim(), address1: address1.trim() });
      setBanner('Company header updated.');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update company header.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;
  if (error && !header) return <div className="section-card error-state">{error}</div>;
  if (!header) return null;

  return (
    <div className="section-card" style={{ maxWidth: 600 }}>
      <h2>Company Report Header</h2>
      {banner && <div className="alert alert-success">{banner}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <table className="data-table">
        <tbody>
          <tr>
            <td>Company Code</td>
            <td>{header.ccode}</td>
          </tr>
          <tr>
            <td>Address 2</td>
            <td>{header.address2 ?? '—'}</td>
          </tr>
          <tr>
            <td>Address 3</td>
            <td>{header.address3 ?? '—'}</td>
          </tr>
          <tr>
            <td>Phone</td>
            <td>{header.phone1 ?? '—'}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>{header.email ?? '—'}</td>
          </tr>
        </tbody>
      </table>

      {isAdmin ? (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Edit</h3>
          <div className="form-group">
            <label htmlFor="company-name">Company Name</label>
            <input
              id="company-name"
              className="form-input"
              value={companyName}
              disabled={saving}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="company-address1">Address Line 1</label>
            <input
              id="company-address1"
              className="form-input"
              value={address1}
              disabled={saving}
              onChange={(e) => setAddress1(e.target.value)}
            />
          </div>
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            {saving && <span className="spinner" />}
            Save
          </button>
        </div>
      ) : (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
          Only Administrators can edit the company header.
        </p>
      )}
    </div>
  );
}
