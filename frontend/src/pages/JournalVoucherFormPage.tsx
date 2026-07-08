import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ledgerApi, JournalVoucherLineInput } from '../api/ledgerApi';
import { ApiError } from '../api/client';
import { JournalLineItemsEditor } from '../components/JournalLineItemsEditor';

export function JournalVoucherFormPage() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState<JournalVoucherLineInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!date) nextErrors.date = 'Date is required.';
    if (!narration.trim()) nextErrors.narration = 'Narration is required.';
    if (lines.length < 2) nextErrors.lines = 'At least two lines are required for a balanced journal entry.';
    else if (!balanced) nextErrors.lines = 'Total debit must equal total credit.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      await ledgerApi.createJournalVoucher({ date, narration: narration.trim(), lines });
      navigate('/banking/vouchers');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save journal voucher. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>New Journal Voucher</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Plain balanced journal entries only. Cheque/PDC vouchers and Receipt/Payment-specific fields are not
        supported by this form.
      </p>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form data-testid="journal-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="journal-form-date">Date</label>
          <input
            id="journal-form-date"
            type="date"
            className={`form-input${errors.date ? ' has-error' : ''}`}
            value={date}
            disabled={saving}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="journal-form-narration">Narration</label>
          <input
            id="journal-form-narration"
            data-testid="journal-form-narration"
            className={`form-input${errors.narration ? ' has-error' : ''}`}
            value={narration}
            disabled={saving}
            onChange={(e) => setNarration(e.target.value)}
          />
          {errors.narration && <div className="field-error">{errors.narration}</div>}
        </div>

        <div className="form-group">
          <label>Accounts</label>
          <JournalLineItemsEditor lines={lines} onChange={setLines} disabled={saving} />
          {errors.lines && <div className="field-error">{errors.lines}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="submit" data-testid="journal-form-save" className="btn-primary" disabled={saving}>
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
