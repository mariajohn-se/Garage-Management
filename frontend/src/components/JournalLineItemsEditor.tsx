import { useState } from 'react';
import { ledgerApi, AccountHead, JournalVoucherLineInput } from '../api/ledgerApi';

interface JournalLineItemsEditorProps {
  lines: JournalVoucherLineInput[];
  onChange: (lines: JournalVoucherLineInput[]) => void;
  disabled?: boolean;
}

export function JournalLineItemsEditor({ lines, onChange, disabled }: JournalLineItemsEditorProps) {
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

  function addAccount(account: AccountHead) {
    onChange([...lines, { ac: account.codes, debit: 0, credit: 0, description: account.description ?? '' }]);
    setQuery('');
    setResults([]);
  }

  function updateLine(index: number, changes: Partial<JournalVoucherLineInput>) {
    onChange(lines.map((l, i) => (i === index ? { ...l, ...changes } : l)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && lines.length >= 2;

  return (
    <div data-testid="journal-form-line-table">
      <div className="form-group" style={{ position: 'relative' }}>
        <label>Add Account</label>
        <input
          className="form-input"
          placeholder="Search account code or description..."
          value={query}
          disabled={disabled}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {results.length > 0 && (
          <div className="autocomplete-panel">
            {results.map((a) => (
              <div key={a.codes} className="autocomplete-option" onClick={() => addAccount(a)}>
                {a.codes} - {a.description}
              </div>
            ))}
          </div>
        )}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-state">
                No accounts added yet.
              </td>
            </tr>
          )}
          {lines.map((line, i) => (
            <tr key={i}>
              <td>{line.ac}</td>
              <td>
                <input
                  className="form-input"
                  value={line.description ?? ''}
                  disabled={disabled}
                  onChange={(e) => updateLine(i, { description: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  style={{ width: 110 }}
                  value={line.debit || ''}
                  disabled={disabled}
                  onChange={(e) => updateLine(i, { debit: Number(e.target.value) || 0, credit: 0 })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  style={{ width: 110 }}
                  value={line.credit || ''}
                  disabled={disabled}
                  onChange={(e) => updateLine(i, { credit: Number(e.target.value) || 0, debit: 0 })}
                />
              </td>
              <td>
                <button type="button" className="btn-outline" disabled={disabled} onClick={() => removeLine(i)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {lines.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={2} style={{ textAlign: 'right', fontWeight: 600 }}>
                Total
              </td>
              <td style={{ fontWeight: 600 }}>{totalDebit.toFixed(2)}</td>
              <td style={{ fontWeight: 600 }}>{totalCredit.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
      {lines.length > 0 && !balanced && (
        <div className="field-error">
          Not balanced - total debit ({totalDebit.toFixed(2)}) must equal total credit ({totalCredit.toFixed(2)}).
        </div>
      )}
    </div>
  );
}
