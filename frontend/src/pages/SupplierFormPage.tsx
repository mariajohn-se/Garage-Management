import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supplierApi } from '../api/partyApi';
import { ApiError } from '../api/client';

export function SupplierFormPage() {
  const { suppId } = useParams();
  const isEdit = Boolean(suppId);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [area, setArea] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!suppId) return;
    supplierApi
      .get(suppId)
      .then((s) => {
        setName(s.name);
        setPhone1(s.phone1 ?? '');
        setPhone2(s.phone2 ?? '');
        setEmail(s.email ?? '');
        setContactPerson(s.contactPerson ?? '');
        setArea(s.area ?? '');
        setRemarks(s.remarks ?? '');
      })
      .catch((err) => setApiError(err instanceof ApiError ? err.message : 'Unable to load supplier.'))
      .finally(() => setLoading(false));
  }, [suppId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Supplier name is required.';
    if (!phone1.trim() && !email.trim()) nextErrors.phone1 = 'At least one of phone or email is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    const payload = {
      name: name.trim(),
      phone1: phone1.trim() || null,
      phone2: phone2.trim() || null,
      email: email.trim() || null,
      contactPerson: contactPerson.trim() || null,
      area: area.trim() || null,
      remarks: remarks.trim() || null,
      address: '',
      emirate: null
    };
    try {
      if (isEdit) {
        await supplierApi.update(suppId!, payload);
      } else {
        await supplierApi.create(payload);
      }
      navigate('/suppliers');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save supplier. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 560 }}>
      <h2>{isEdit ? 'Edit Supplier' : 'New Supplier'}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form data-testid="suppform-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="suppform-name">Name</label>
          <input
            id="suppform-name"
            data-testid="suppform-name"
            className={`form-input${errors.name ? ' has-error' : ''}`}
            value={name}
            disabled={saving}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="suppform-phone1">Phone</label>
          <input
            id="suppform-phone1"
            data-testid="suppform-phone1"
            className={`form-input${errors.phone1 ? ' has-error' : ''}`}
            value={phone1}
            disabled={saving}
            onChange={(e) => setPhone1(e.target.value)}
          />
          {errors.phone1 && <div className="field-error">{errors.phone1}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="suppform-phone2">Alternate Phone</label>
          <input
            id="suppform-phone2"
            data-testid="suppform-phone2"
            className="form-input"
            value={phone2}
            disabled={saving}
            onChange={(e) => setPhone2(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="suppform-email">Email</label>
          <input
            id="suppform-email"
            data-testid="suppform-email"
            type="email"
            className="form-input"
            value={email}
            disabled={saving}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="suppform-contact">Contact Person</label>
          <input
            id="suppform-contact"
            data-testid="suppform-contact"
            className="form-input"
            value={contactPerson}
            disabled={saving}
            onChange={(e) => setContactPerson(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="suppform-area">Area</label>
          <input
            id="suppform-area"
            data-testid="suppform-area"
            className="form-input"
            value={area}
            disabled={saving}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="suppform-remarks">Remarks</label>
          <input
            id="suppform-remarks"
            data-testid="suppform-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" data-testid="suppform-save" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save Supplier
          </button>
          <button
            type="button"
            data-testid="suppform-cancel"
            className="btn-secondary"
            disabled={saving}
            onClick={() => navigate('/suppliers')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
