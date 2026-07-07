import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleApi } from '../api/partyApi';
import { ApiError } from '../api/client';

export function VehicleFormPage() {
  const { vehId } = useParams();
  const isEdit = Boolean(vehId);
  const navigate = useNavigate();

  const [vehNo, setVehNo] = useState('');
  const [make, setMake] = useState('');
  const [colour, setColour] = useState('');
  const [manYear, setManYear] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vehId) return;
    vehicleApi
      .get(Number(vehId))
      .then((v) => {
        setVehNo(v.vehNo ?? '');
        setMake(v.make ?? '');
        setColour(v.colour ?? '');
        setManYear(v.manYear ?? '');
        setEngineNo(v.engineNo ?? '');
        setRemarks(v.remarks ?? '');
      })
      .catch((err) => setApiError(err instanceof ApiError ? err.message : 'Unable to load vehicle.'))
      .finally(() => setLoading(false));
  }, [vehId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!vehNo.trim()) {
      setErrors({ vehNo: 'Registration number is required.' });
      return;
    }
    setErrors({});
    setApiError(null);
    setSaving(true);
    const payload = {
      vehNo: vehNo.trim(),
      make: make.trim() || null,
      colour: colour.trim() || null,
      manYear: manYear.trim() || null,
      engineNo: engineNo.trim() || null,
      remarks: remarks.trim() || null,
      regType: null
    };
    try {
      if (isEdit) {
        await vehicleApi.update(Number(vehId), payload);
      } else {
        await vehicleApi.create(payload);
      }
      navigate('/vehicles');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save vehicle. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 560 }}>
      <h2>{isEdit ? 'Edit Vehicle' : 'New Vehicle'}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form data-testid="vehform-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="vehform-regno">Registration Number</label>
          <input
            id="vehform-regno"
            data-testid="vehform-regno"
            className={`form-input${errors.vehNo ? ' has-error' : ''}`}
            value={vehNo}
            disabled={saving}
            onChange={(e) => setVehNo(e.target.value)}
          />
          {errors.vehNo && <div className="field-error">{errors.vehNo}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="vehform-make">Make / Model</label>
          <input
            id="vehform-make"
            data-testid="vehform-make"
            className="form-input"
            value={make}
            disabled={saving}
            onChange={(e) => setMake(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="vehform-colour">Colour</label>
          <input
            id="vehform-colour"
            data-testid="vehform-colour"
            className="form-input"
            value={colour}
            disabled={saving}
            onChange={(e) => setColour(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="vehform-year">Year</label>
          <input
            id="vehform-year"
            data-testid="vehform-year"
            className="form-input"
            value={manYear}
            disabled={saving}
            onChange={(e) => setManYear(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="vehform-engine">Engine No</label>
          <input
            id="vehform-engine"
            data-testid="vehform-engine"
            className="form-input"
            value={engineNo}
            disabled={saving}
            onChange={(e) => setEngineNo(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="vehform-remarks">Remarks</label>
          <input
            id="vehform-remarks"
            data-testid="vehform-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" data-testid="vehform-save" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save Vehicle
          </button>
          <button
            type="button"
            data-testid="vehform-cancel"
            className="btn-secondary"
            disabled={saving}
            onClick={() => navigate('/vehicles')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
