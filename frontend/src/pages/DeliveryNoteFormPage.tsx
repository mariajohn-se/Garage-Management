import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi } from '../api/salesApi';
import { ApiError } from '../api/client';

export function DeliveryNoteFormPage() {
  const navigate = useNavigate();
  const [ordr, setOrdr] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [remarks, setRemarks] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!ordr.trim()) nextErrors.ordr = 'Order reference is required.';
    if (!deliveredBy.trim()) nextErrors.deliveredBy = 'Delivered By is required.';
    if (!acknowledged) nextErrors.ack = 'Acknowledgement is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      await salesApi.createDeliveryNote({
        ordr: ordr.trim(),
        deliveredBy: deliveredBy.trim(),
        remarks: remarks.trim() || undefined
      });
      navigate('/delivery-notes');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save delivery note. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 560 }}>
      <h2>New Delivery Note</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="dn-ordr">Linked Order #</label>
          <input
            id="dn-ordr"
            className={`form-input${errors.ordr ? ' has-error' : ''}`}
            value={ordr}
            disabled={saving}
            onChange={(e) => setOrdr(e.target.value)}
          />
          {errors.ordr && <div className="field-error">{errors.ordr}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="dn-deliveredby">Delivered By</label>
          <input
            id="dn-deliveredby"
            className={`form-input${errors.deliveredBy ? ' has-error' : ''}`}
            value={deliveredBy}
            disabled={saving}
            onChange={(e) => setDeliveredBy(e.target.value)}
          />
          {errors.deliveredBy && <div className="field-error">{errors.deliveredBy}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="dn-remarks">Remarks</label>
          <input
            id="dn-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} /> I
            acknowledge this delivery
          </label>
          {errors.ack && <div className="field-error">{errors.ack}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => navigate('/delivery-notes')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
