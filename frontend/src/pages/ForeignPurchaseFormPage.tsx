import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { purchaseApi } from '../api/purchaseApi';
import { supplierApi, Supplier } from '../api/partyApi';
import { ApiError } from '../api/client';
import { LineItemsEditor, LineItem } from '../components/LineItemsEditor';

export function ForeignPurchaseFormPage() {
  const { purchaseOrderId } = useParams();
  const isEdit = Boolean(purchaseOrderId);
  const navigate = useNavigate();

  const [suppQuery, setSuppQuery] = useState('');
  const [suppResults, setSuppResults] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!purchaseOrderId) return;
    purchaseApi
      .getForeign(Number(purchaseOrderId))
      .then((po) => {
        setSelectedSupplier({
          suppId: po.suppId ?? '',
          name: po.supplierName ?? '',
          address: '',
          emirate: null,
          contactPerson: null,
          phone1: null,
          phone2: null,
          email: null,
          area: null,
          activeFlag: null,
          remarks: null
        });
        setCurrency(po.currency ?? '');
        setRemarks(po.remarks ?? '');
      })
      .catch((err) => setApiError(err instanceof ApiError ? err.message : 'Unable to load purchase order.'))
      .finally(() => setLoading(false));
  }, [purchaseOrderId]);

  async function handleSupplierSearch(value: string) {
    setSuppQuery(value);
    if (!value.trim()) {
      setSuppResults([]);
      return;
    }
    setSuppResults(await supplierApi.help(value.trim()));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!selectedSupplier) nextErrors.supplier = 'Supplier is required.';
    if (!orderDate) nextErrors.date = 'Order date is required.';
    if (items.length === 0) nextErrors.items = 'At least one item is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await purchaseApi.updateForeign(Number(purchaseOrderId), {
          suppId: selectedSupplier!.suppId,
          remarks,
          items
        });
      } else {
        await purchaseApi.createForeign({
          suppId: selectedSupplier!.suppId,
          orderDate,
          currency: currency || undefined,
          remarks: remarks || undefined,
          items
        });
      }
      navigate('/purchases/foreign');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save purchase order. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>{isEdit ? 'Edit Foreign Purchase Order' : 'New Foreign Purchase Order'}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="fpe-supplier">Supplier (Foreign)</label>
          <input
            id="fpe-supplier"
            className={`form-input${errors.supplier ? ' has-error' : ''}`}
            placeholder="Search supplier..."
            value={selectedSupplier ? selectedSupplier.name : suppQuery}
            disabled={saving || isEdit}
            onChange={(e) => {
              setSelectedSupplier(null);
              handleSupplierSearch(e.target.value);
            }}
          />
          {errors.supplier && <div className="field-error">{errors.supplier}</div>}
          {suppResults.length > 0 && !selectedSupplier && (
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
              {suppResults.map((s) => (
                <div
                  key={s.suppId}
                  style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedSupplier(s);
                    setSuppResults([]);
                  }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="fpe-date">Order Date</label>
          <input
            id="fpe-date"
            type="date"
            className={`form-input${errors.date ? ' has-error' : ''}`}
            value={orderDate}
            disabled={saving || isEdit}
            onChange={(e) => setOrderDate(e.target.value)}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="fpe-currency">Currency</label>
          <input
            id="fpe-currency"
            className="form-input"
            value={currency}
            disabled={saving}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fpe-remarks">Remarks</label>
          <input
            id="fpe-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Items</label>
          <LineItemsEditor items={items} onChange={setItems} disabled={saving} />
          {errors.items && <div className="field-error">{errors.items}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={saving}
            onClick={() => navigate('/purchases/foreign')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
