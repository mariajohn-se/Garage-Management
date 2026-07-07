import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ledgerApi, AccountHead } from '../api/ledgerApi';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function AccountHeadDetailPage() {
  const { codes } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = session?.roles.includes('Administrator');

  const [head, setHead] = useState<AccountHead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    ledgerApi
      .getAccountHead(codes ?? '')
      .then((h) => {
        setHead(h);
        setDescription(h.description ?? '');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load account head.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [codes]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setBanner(null);
    try {
      await ledgerApi.updateAccountHead(codes ?? '', { description: description.trim() || undefined });
      setBanner('Account head updated.');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update account head.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;
  if (error && !head) return <div className="section-card error-state">{error}</div>;
  if (!head) return null;

  return (
    <div className="section-card" style={{ maxWidth: 600 }}>
      <h2>Account Head {head.codes}</h2>
      {banner && <div className="alert alert-success">{banner}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <table className="data-table">
        <tbody>
          <tr>
            <td>Group</td>
            <td>{head.groupDescription ?? '—'}</td>
          </tr>
          <tr>
            <td>Group Tree</td>
            <td>{head.groupTree ?? '—'}</td>
          </tr>
          <tr>
            <td>Bank Account</td>
            <td>{head.bank ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Customer Account</td>
            <td>{head.customer ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Supplier Account</td>
            <td>{head.supplier ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td>Locked</td>
            <td>{head.locked ? 'Yes' : 'No'}</td>
          </tr>
        </tbody>
      </table>

      {isAdmin && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Edit</h3>
          <div className="form-group">
            <label htmlFor="ahead-description">Description</label>
            <input
              id="ahead-description"
              className="form-input"
              value={description}
              disabled={saving}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            {saving && <span className="spinner" />}
            Save
          </button>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-5)' }}>
        <button className="btn-outline" onClick={() => navigate('/ledger/account-heads')}>
          Back to List
        </button>
      </div>
    </div>
  );
}
