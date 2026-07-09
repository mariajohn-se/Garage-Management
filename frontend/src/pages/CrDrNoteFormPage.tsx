import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crDrNoteApi } from '../api/crDrNoteApi';
import { ledgerApi, AccountHead } from '../api/ledgerApi';
import { ApiError } from '../api/client';

function AccountPicker({
  label,
  selected,
  onSelect,
  disabled,
  error
}: {
  label: string;
  selected: AccountHead | null;
  onSelect: (a: AccountHead | null) => void;
  disabled?: boolean;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AccountHead[]>([]);

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const res = await ledgerApi.listAccountHeads({ search: value.trim(), page: 1, limit: 10 });
    setResults(res.items.filter((a) => !a.locked));
  }

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      <label>{label}</label>
      <input
        className={`form-input${error ? ' has-error' : ''}`}
        placeholder="Search account code or description..."
        value={selected ? `${selected.codes} - ${selected.description}` : query}
        disabled={disabled}
        onChange={(e) => {
          onSelect(null);
          handleSearch(e.target.value);
        }}
      />
      {error && <div className="field-error">{error}</div>}
      {results.length > 0 && !selected && (
        <div className="autocomplete-panel">
          {results.map((a) => (
            <div
              key={a.codes}
              className="autocomplete-option"
              onClick={() => {
                onSelect(a);
                setResults([]);
              }}
            >
              {a.codes} - {a.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CrDrNoteFormPage() {
  const navigate = useNavigate();

  const [type, setType] = useState<'Credit' | 'Debit'>('Credit');
  const [refDt, setRefDt] = useState(new Date().toISOString().slice(0, 10));
  const [account, setAccount] = useState<AccountHead | null>(null);
  const [contraAccount, setContraAccount] = useState<AccountHead | null>(null);
  const [amount, setAmount] = useState(0);
  const [narration, setNarration] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!account) nextErrors.account = 'Account is required.';
    if (!contraAccount) nextErrors.contraAccount = 'Contra account is required.';
    if (account && contraAccount && account.codes === contraAccount.codes) {
      nextErrors.contraAccount = 'Contra account must differ from the account.';
    }
    if (!amount || amount <= 0) nextErrors.amount = 'Amount must be greater than zero.';
    if (!refDt) nextErrors.date = 'Date is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      await crDrNoteApi.create({
        refDt,
        type,
        ac: account!.codes,
        vac: contraAccount!.codes,
        amount,
        narration: narration || null
      });
      navigate('/cr-dr-notes');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 700 }}>
      <h2>New Credit / Debit Note</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="crdr-form-type">Type</label>
            <select
              id="crdr-form-type"
              className="form-input"
              value={type}
              disabled={saving}
              onChange={(e) => setType(e.target.value as 'Credit' | 'Debit')}
            >
              <option value="Credit">Credit Note</option>
              <option value="Debit">Debit Note</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="crdr-form-date">Date</label>
            <input
              id="crdr-form-date"
              type="date"
              className={`form-input${errors.date ? ' has-error' : ''}`}
              value={refDt}
              disabled={saving}
              onChange={(e) => setRefDt(e.target.value)}
            />
            {errors.date && <div className="field-error">{errors.date}</div>}
          </div>
        </div>

        <AccountPicker label="Account (debited)" selected={account} onSelect={setAccount} disabled={saving} error={errors.account} />
        <AccountPicker
          label="Contra Account (credited)"
          selected={contraAccount}
          onSelect={setContraAccount}
          disabled={saving}
          error={errors.contraAccount}
        />

        <div className="form-group">
          <label htmlFor="crdr-form-amount">Amount</label>
          <input
            id="crdr-form-amount"
            type="number"
            min={0}
            className={`form-input${errors.amount ? ' has-error' : ''}`}
            value={amount || ''}
            disabled={saving}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />
          {errors.amount && <div className="field-error">{errors.amount}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="crdr-form-narration">Narration</label>
          <input
            id="crdr-form-narration"
            className="form-input"
            value={narration}
            disabled={saving}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => navigate('/cr-dr-notes')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
