import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi, StockMovementLineInput } from '../api/inventoryApi';
import { ApiError } from '../api/client';
import { StockLineItemsEditor } from '../components/StockLineItemsEditor';

interface StockMovementFormPageProps {
  kind: 'in' | 'out';
}

export function StockMovementFormPage({ kind }: StockMovementFormPageProps) {
  const navigate = useNavigate();
  const label = kind === 'in' ? 'Stock In' : 'Stock Out';
  const listPath = kind === 'in' ? '/inventory/stock-in' : '/inventory/stock-out';

  const [stockDate, setStockDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState<StockMovementLineInput[]>([]);
  const [godowns, setGodowns] = useState<Array<{ ocode: string; name: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    inventoryApi
      .listGodowns()
      .then(setGodowns)
      .catch(() => setGodowns([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!stockDate) nextErrors.date = 'Date is required.';
    if (lines.length === 0) nextErrors.lines = 'At least one line item is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      const input = { stockDate, remarks: remarks || null, lines };
      if (kind === 'in') {
        await inventoryApi.createStockIn(input);
      } else {
        await inventoryApi.createStockOut(input);
      }
      navigate(listPath);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : `Unable to save ${label.toLowerCase()} entry. Please try again.`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>New {label}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form data-testid="stock-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="stock-form-date">Date</label>
          <input
            id="stock-form-date"
            type="date"
            className={`form-input${errors.date ? ' has-error' : ''}`}
            value={stockDate}
            disabled={saving}
            onChange={(e) => setStockDate(e.target.value)}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="stock-form-remarks">Remarks</label>
          <input
            id="stock-form-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Items</label>
          <StockLineItemsEditor lines={lines} onChange={setLines} godowns={godowns} disabled={saving} />
          {errors.lines && <div className="field-error">{errors.lines}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="submit" data-testid="stock-form-save" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => navigate(listPath)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
