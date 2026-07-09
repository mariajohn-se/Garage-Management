import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { orderApi } from '../api/salesApi';
import { customerApi, Customer } from '../api/partyApi';
import { ApiError } from '../api/client';
import { LineItemsEditor, LineItem } from '../components/LineItemsEditor';

export function OrderFormPage() {
  const { orderId } = useParams();
  const isEdit = Boolean(orderId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Prefill support for Estimation Detail's "Convert to Job Order" action - see
  // EstimationDetailPage.tsx. estimationRef is stored on the real SalesOrdr01.Estimation column.
  const estimationRef = searchParams.get('estimationNo') || null;
  const prefillCustId = searchParams.get('custId') || '';
  const prefillCustName = searchParams.get('custName') || '';
  const prefillVehId = searchParams.get('vehId') || '';

  const [custQuery, setCustQuery] = useState('');
  const [custResults, setCustResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    !isEdit && prefillCustId
      ? {
          custId: prefillCustId,
          name: prefillCustName,
          address: '',
          emirate: null,
          contactPerson: null,
          phone1: null,
          phone2: null,
          email: null,
          area: null,
          isActive: true,
          remarks: null
        }
      : null
  );
  const [vehId, setVehId] = useState(!isEdit ? prefillVehId : '');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [custNote, setCustNote] = useState(
    !isEdit && estimationRef ? `Created from Estimation #${estimationRef}` : ''
  );
  const [items, setItems] = useState<LineItem[]>([]);
  const [locked, setLocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    orderApi
      .get(Number(orderId))
      .then((o) => {
        setSelectedCustomer({
          custId: o.custId ?? '',
          name: o.customerName ?? '',
          address: '',
          emirate: null,
          contactPerson: null,
          phone1: null,
          phone2: null,
          email: null,
          area: null,
          isActive: true,
          remarks: null
        });
        setVehId(o.vehId ? String(o.vehId) : '');
        setOrderDate(o.orderDate ? o.orderDate.slice(0, 10) : orderDate);
        setCustNote(o.custNote ?? '');
        setLocked(o.delivered);
      })
      .catch((err) => setApiError(err instanceof ApiError ? err.message : 'Unable to load order.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

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
    if (!orderDate) nextErrors.date = 'Order date is required.';
    if (items.length === 0) nextErrors.items = 'At least one item is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await orderApi.update(Number(orderId), {
          custId: selectedCustomer!.custId,
          vehId: vehId ? Number(vehId) : null,
          custNote,
          items: locked ? undefined : items
        });
      } else {
        await orderApi.create({
          custId: selectedCustomer!.custId,
          vehId: vehId ? Number(vehId) : null,
          orderDate,
          custNote: custNote || null,
          estimationRef,
          items
        });
      }
      navigate('/orders');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save order. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>{isEdit ? 'Edit Sales Order' : 'New Sales Order'}</h2>
      {!isEdit && estimationRef && (
        <div className="alert alert-success">Converting Estimation #{estimationRef} to a job order.</div>
      )}
      {apiError && <div className="alert alert-error">{apiError}</div>}
      {locked && <div className="alert alert-error">This order has been delivered - items are locked (BR-57).</div>}

      <form data-testid="order-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="order-form-customer">Customer</label>
          <input
            id="order-form-customer"
            data-testid="order-form-customer"
            className={`form-input${errors.customer ? ' has-error' : ''}`}
            placeholder="Search customer..."
            value={selectedCustomer ? selectedCustomer.name : custQuery}
            disabled={saving || isEdit}
            onChange={(e) => {
              setSelectedCustomer(null);
              handleCustomerSearch(e.target.value);
            }}
          />
          {errors.customer && <div className="field-error">{errors.customer}</div>}
          {custResults.length > 0 && !selectedCustomer && (
            <div
              style={{
                position: 'absolute',
                zIndex: 10,
                background: '#fff',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 'var(--radius-sm)',
                width: '100%',
                maxHeight: 200,
                overflowY: 'auto'
              }}
            >
              {custResults.map((c) => (
                <div
                  key={c.custId}
                  style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}
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

        <div className="form-group">
          <label htmlFor="order-form-vehicle">Vehicle ID (optional)</label>
          <input
            id="order-form-vehicle"
            data-testid="order-form-vehicle"
            className="form-input"
            value={vehId}
            disabled={saving}
            onChange={(e) => setVehId(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="order-form-date">Order Date</label>
          <input
            id="order-form-date"
            type="date"
            className={`form-input${errors.date ? ' has-error' : ''}`}
            value={orderDate}
            disabled={saving || isEdit}
            onChange={(e) => setOrderDate(e.target.value)}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="order-form-notes">Notes</label>
          <input
            id="order-form-notes"
            data-testid="order-form-notes"
            className="form-input"
            value={custNote}
            disabled={saving}
            onChange={(e) => setCustNote(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Items</label>
          <LineItemsEditor items={items} onChange={setItems} disabled={saving || locked} />
          {errors.items && <div className="field-error">{errors.items}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="submit" data-testid="order-form-save" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => navigate('/orders')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
