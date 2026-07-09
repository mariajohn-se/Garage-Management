import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesReturnApi, SalesReturnLineInput } from '../api/salesReturnApi';
import { customerApi, Customer } from '../api/partyApi';
import { ApiError } from '../api/client';
import { SalesReturnLineItemsEditor } from '../components/SalesReturnLineItemsEditor';

export function SalesReturnFormPage() {
  const navigate = useNavigate();

  const [custQuery, setCustQuery] = useState('');
  const [custResults, setCustResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [sretDt, setSretDt] = useState(new Date().toISOString().slice(0, 10));
  const [corQ, setCorQ] = useState<'Cash' | 'Credit'>('Credit');
  const [bill, setBill] = useState('');
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState<SalesReturnLineInput[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCustomerSearch(value: string) {
    setCustQuery(value);
    if (!value.trim()) {
      setCustResults([]);
      return;
    }
    setCustResults(await customerApi.help(value.trim()));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!selectedCustomer) nextErrors.customer = 'Customer is required.';
    if (!sretDt) nextErrors.date = 'Return date is required.';
    if (lines.length === 0) nextErrors.lines = 'At least one line item is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      await salesReturnApi.create({
        sretDt,
        custId: selectedCustomer!.custId,
        corQ,
        bill: bill.trim() || null,
        remarks: remarks || null,
        lines
      });
      navigate('/sales-returns');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save sales return. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>New Sales Return</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="sret-form-customer">Customer</label>
          <input
            id="sret-form-customer"
            className={`form-input${errors.customer ? ' has-error' : ''}`}
            placeholder="Search customer..."
            value={selectedCustomer ? selectedCustomer.name : custQuery}
            disabled={saving}
            onChange={(e) => {
              setSelectedCustomer(null);
              handleCustomerSearch(e.target.value);
            }}
          />
          {errors.customer && <div className="field-error">{errors.customer}</div>}
          {custResults.length > 0 && !selectedCustomer && (
            <div className="autocomplete-panel">
              {custResults.map((c) => (
                <div
                  key={c.custId}
                  className="autocomplete-option"
                  onClick={() => {
                    setSelectedCustomer(c);
                    setCustResults([]);
                  }}
                >
                  {c.name} ({c.phone1 || c.phone2 || 'no phone'})
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="sret-form-date">Return Date</label>
            <input
              id="sret-form-date"
              type="date"
              className={`form-input${errors.date ? ' has-error' : ''}`}
              value={sretDt}
              disabled={saving}
              onChange={(e) => setSretDt(e.target.value)}
            />
            {errors.date && <div className="field-error">{errors.date}</div>}
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="sret-form-corq">Type</label>
            <select
              id="sret-form-corq"
              className="form-input"
              value={corQ}
              disabled={saving}
              onChange={(e) => setCorQ(e.target.value as 'Cash' | 'Credit')}
            >
              <option value="Credit">Credit</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sret-form-bill">Original Bill # (optional)</label>
          <input
            id="sret-form-bill"
            className="form-input"
            placeholder="Reference to the original sales invoice, if known"
            value={bill}
            disabled={saving}
            onChange={(e) => setBill(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sret-form-remarks">Remarks</label>
          <input
            id="sret-form-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Returned Items</label>
          <SalesReturnLineItemsEditor lines={lines} onChange={setLines} disabled={saving} />
          {errors.lines && <div className="field-error">{errors.lines}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => navigate('/sales-returns')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
