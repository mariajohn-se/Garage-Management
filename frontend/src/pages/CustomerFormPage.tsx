import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerApi } from '../api/partyApi';
import { ApiError } from '../api/client';

export function CustomerFormPage() {
  const { custId } = useParams();
  const isEdit = Boolean(custId);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [area, setArea] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!custId) return;
    customerApi
      .get(custId)
      .then((c) => {
        setName(c.name);
        setPhone1(c.phone1 ?? '');
        setPhone2(c.phone2 ?? '');
        setEmail(c.email ?? '');
        setContactPerson(c.contactPerson ?? '');
        setArea(c.area ?? '');
        setRemarks(c.remarks ?? '');
        setIsActive(c.isActive);
      })
      .catch((err) => setApiError(err instanceof ApiError ? err.message : 'Unable to load customer.'))
      .finally(() => setLoading(false));
  }, [custId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Customer name is required.';
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
        await customerApi.update(custId!, { ...payload, isActive });
      } else {
        await customerApi.create(payload);
      }
      navigate('/customers');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save customer. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 560 }}>
      <h2>{isEdit ? 'Edit Customer' : 'New Customer'}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form data-testid="custform-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="custform-name">Name</label>
          <input
            id="custform-name"
            data-testid="custform-name"
            className={`form-input${errors.name ? ' has-error' : ''}`}
            value={name}
            disabled={saving}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="custform-phone1">Phone</label>
          <input
            id="custform-phone1"
            data-testid="custform-phone1"
            className={`form-input${errors.phone1 ? ' has-error' : ''}`}
            value={phone1}
            disabled={saving}
            onChange={(e) => setPhone1(e.target.value)}
          />
          {errors.phone1 && <div className="field-error">{errors.phone1}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="custform-phone2">Alternate Phone</label>
          <input
            id="custform-phone2"
            data-testid="custform-phone2"
            className="form-input"
            value={phone2}
            disabled={saving}
            onChange={(e) => setPhone2(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="custform-email">Email</label>
          <input
            id="custform-email"
            data-testid="custform-email"
            type="email"
            className="form-input"
            value={email}
            disabled={saving}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="custform-contact">Contact Person</label>
          <input
            id="custform-contact"
            data-testid="custform-contact"
            className="form-input"
            value={contactPerson}
            disabled={saving}
            onChange={(e) => setContactPerson(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="custform-area">Area</label>
          <input
            id="custform-area"
            data-testid="custform-area"
            className="form-input"
            value={area}
            disabled={saving}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        {isEdit && (
          <div className="form-group">
            <label htmlFor="custform-status">Status</label>
            <select
              id="custform-status"
              data-testid="custform-status"
              className="form-input"
              value={isActive ? 'active' : 'inactive'}
              disabled={saving}
              onChange={(e) => setIsActive(e.target.value === 'active')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="custform-remarks">Remarks</label>
          <input
            id="custform-remarks"
            data-testid="custform-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" data-testid="custform-save" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save Customer
          </button>
          <button
            type="button"
            data-testid="custform-cancel"
            className="btn-secondary"
            disabled={saving}
            onClick={() => navigate('/customers')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
