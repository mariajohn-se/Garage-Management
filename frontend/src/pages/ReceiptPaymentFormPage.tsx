import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bankingApi, BankAccount, ReceiptPaymentLineInput } from '../api/bankingApi';
import { ApiError } from '../api/client';
import { ReceiptPaymentLineItemsEditor } from '../components/ReceiptPaymentLineItemsEditor';

export function ReceiptPaymentFormPage() {
  const { type: typeParam } = useParams();
  const navigate = useNavigate();
  const type = typeParam === 'payment' ? 'Payment' : 'Receipt';
  const label = type === 'Receipt' ? 'Receipt' : 'Payment';

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cashBankAc, setCashBankAc] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [narration, setNarration] = useState('');
  const [chq, setChq] = useState('');
  const [lines, setLines] = useState<ReceiptPaymentLineInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    bankingApi
      .listBankAccounts()
      .then((accounts) => {
        setBankAccounts(accounts);
        if (accounts.length) setCashBankAc(accounts.find((a) => a.code === 'CASH')?.code ?? accounts[0].code);
      })
      .catch(() => setBankAccounts([]))
      .finally(() => setLoading(false));
  }, []);

  const total = lines.reduce((sum, l) => sum + (l.amount || 0), 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!date) nextErrors.date = 'Date is required.';
    if (!cashBankAc) nextErrors.cashBankAc = 'Cash/bank account is required.';
    if (!narration.trim()) nextErrors.narration = 'Narration is required.';
    if (lines.length === 0) nextErrors.lines = 'At least one account line is required.';
    else if (lines.some((l) => !l.amount || l.amount <= 0)) {
      nextErrors.lines = 'Every line requires an amount greater than zero.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      await bankingApi.createReceiptPaymentVoucher({
        type,
        date,
        cashBankAc,
        narration: narration.trim(),
        chq: chq.trim() || undefined,
        lines
      });
      navigate('/banking/vouchers');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : `Unable to save ${label.toLowerCase()} voucher. Please try again.`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>New {label}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form data-testid="receipt-payment-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="rp-form-date">Date</label>
          <input
            id="rp-form-date"
            type="date"
            className={`form-input${errors.date ? ' has-error' : ''}`}
            value={date}
            disabled={saving}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="rp-form-account">Cash / Bank Account</label>
          <select
            id="rp-form-account"
            data-testid="rp-form-account"
            className={`form-input${errors.cashBankAc ? ' has-error' : ''}`}
            value={cashBankAc}
            disabled={saving}
            onChange={(e) => setCashBankAc(e.target.value)}
          >
            {bankAccounts.map((a) => (
              <option key={a.code} value={a.code}>
                {a.description ?? a.code}
              </option>
            ))}
          </select>
          {errors.cashBankAc && <div className="field-error">{errors.cashBankAc}</div>}
        </div>

        {type === 'Payment' && (
          <div className="form-group">
            <label htmlFor="rp-form-chq">Cheque # (optional)</label>
            <input
              id="rp-form-chq"
              className="form-input"
              value={chq}
              disabled={saving}
              onChange={(e) => setChq(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="rp-form-narration">Narration</label>
          <input
            id="rp-form-narration"
            data-testid="rp-form-narration"
            className={`form-input${errors.narration ? ' has-error' : ''}`}
            value={narration}
            disabled={saving}
            onChange={(e) => setNarration(e.target.value)}
          />
          {errors.narration && <div className="field-error">{errors.narration}</div>}
        </div>

        <div className="form-group">
          <label>{type === 'Receipt' ? 'Received From' : 'Paid To'} (accounts)</label>
          <ReceiptPaymentLineItemsEditor lines={lines} onChange={setLines} excludeAc={cashBankAc} disabled={saving} />
          {errors.lines && <div className="field-error">{errors.lines}</div>}
        </div>

        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          Total {label.toLowerCase()} amount: {total.toFixed(2)}
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" data-testid="receipt-payment-form-save" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => navigate('/banking/vouchers')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
