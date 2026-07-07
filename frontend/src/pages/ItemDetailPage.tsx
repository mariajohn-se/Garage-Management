import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryApi, Item } from '../api/inventoryApi';
import { ApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function ItemDetailPage() {
  const { itemCode } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const canEdit = session?.roles.some((r) => r === 'Supervisor' || r === 'Administrator');

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    inventoryApi
      .getItem(itemCode ?? '')
      .then((it) => {
        setItem(it);
        setDescription(it.description ?? '');
        setReorderLevel(it.reorderLevel != null ? String(it.reorderLevel) : '');
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Unable to load item.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [itemCode]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setBanner(null);
    try {
      await inventoryApi.updateItem(itemCode ?? '', {
        description: description.trim() || undefined,
        reorderLevel: reorderLevel.trim() === '' ? undefined : Number(reorderLevel)
      });
      setBanner('Item updated.');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update item.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;
  if (error && !item) return <div className="section-card error-state">{error}</div>;
  if (!item) return null;

  return (
    <div className="section-card" style={{ maxWidth: 600 }}>
      <h2>Item {item.itemCode}</h2>
      {banner && <div className="alert alert-success">{banner}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <table className="data-table">
        <tbody>
          <tr>
            <td>Category</td>
            <td>{item.category ?? '—'}</td>
          </tr>
          <tr>
            <td>Unit</td>
            <td>{item.denom ?? '—'}</td>
          </tr>
          <tr>
            <td>Sales Rate</td>
            <td>{item.salesRate ?? '—'}</td>
          </tr>
          <tr>
            <td>Cost</td>
            <td>{item.cost ?? '—'}</td>
          </tr>
          <tr>
            <td>Stock on Hand</td>
            <td>{item.stock ?? '—'}</td>
          </tr>
          <tr>
            <td>Active</td>
            <td>{item.isActive ? 'Yes' : 'No'}</td>
          </tr>
        </tbody>
      </table>

      {canEdit && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Edit</h3>
          <div className="form-group">
            <label htmlFor="item-description">Description</label>
            <input
              id="item-description"
              className="form-input"
              value={description}
              disabled={saving}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="item-reorder-level">Reorder Level</label>
            <input
              id="item-reorder-level"
              type="number"
              min="0"
              className="form-input"
              value={reorderLevel}
              disabled={saving}
              onChange={(e) => setReorderLevel(e.target.value)}
            />
          </div>
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            {saving && <span className="spinner" />}
            Save
          </button>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-5)' }}>
        <button className="btn-outline" onClick={() => navigate('/inventory/items')}>
          Back to List
        </button>
      </div>
    </div>
  );
}
