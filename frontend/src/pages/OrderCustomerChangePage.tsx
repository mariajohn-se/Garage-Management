import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi, SalesOrder } from '../api/salesApi';
import { customerApi, Customer } from '../api/partyApi';
import { ApiError } from '../api/client';

export function OrderCustomerChangePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState<Customer | null>(null);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    orderApi
      .get(Number(orderId))
      .then(setOrder)
      .catch((err) => setApiError(err instanceof ApiError ? err.message : 'Unable to load order.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleSearch(value: string) {
    setQuery(value);
    setNewCustomer(null);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setResults(await customerApi.help(value.trim()));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!newCustomer) nextErrors.customer = 'New customer is required.';
    else if (newCustomer.custId === order?.custId)
      nextErrors.customer = 'New customer must differ from the current customer.';
    if (!reason.trim()) nextErrors.reason = 'Reason is required.';
    if (!confirmed) nextErrors.confirm = 'Confirmation is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      await orderApi.changeCustomer(Number(orderId), newCustomer!.custId, reason.trim());
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to change customer.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;
  if (!order) return <div className="section-card error-state">{apiError}</div>;

  return (
    <div className="section-card" style={{ maxWidth: 560 }}>
      <h2>Change Order Customer</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <div className="form-group">
        <label>Order #</label>
        <input className="form-input" value={order.ordr} disabled readOnly />
      </div>
      <div className="form-group">
        <label>Current Customer</label>
        <input className="form-input" value={order.customerName ?? ''} disabled readOnly />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="occ-newcust">New Customer</label>
          <input
            id="occ-newcust"
            className={`form-input${errors.customer ? ' has-error' : ''}`}
            placeholder="Search customer..."
            value={newCustomer ? newCustomer.name : query}
            disabled={saving}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {errors.customer && <div className="field-error">{errors.customer}</div>}
          {results.length > 0 && !newCustomer && (
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
              {results.map((c) => (
                <div
                  key={c.custId}
                  style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}
                  onClick={() => {
                    setNewCustomer(c);
                    setResults([]);
                  }}
                >
                  {c.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="occ-reason">Reason</label>
          <input
            id="occ-reason"
            className={`form-input${errors.reason ? ' has-error' : ''}`}
            value={reason}
            disabled={saving}
            onChange={(e) => setReason(e.target.value)}
          />
          {errors.reason && <div className="field-error">{errors.reason}</div>}
        </div>

        <div className="form-group">
          <label>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> I confirm
            this customer change
          </label>
          {errors.confirm && <div className="field-error">{errors.confirm}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={saving}
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
