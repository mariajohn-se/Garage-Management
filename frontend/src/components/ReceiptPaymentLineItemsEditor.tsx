import { useState } from 'react';
import { ledgerApi, AccountHead } from '../api/ledgerApi';
import { ReceiptPaymentLineInput } from '../api/bankingApi';

interface ReceiptPaymentLineItemsEditorProps {
  lines: ReceiptPaymentLineInput[];
  onChange: (lines: ReceiptPaymentLineInput[]) => void;
  excludeAc?: string;
  disabled?: boolean;
}

export function ReceiptPaymentLineItemsEditor({ lines, onChange, excludeAc, disabled }: ReceiptPaymentLineItemsEditorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AccountHead[]>([]);

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const res = await ledgerApi.listAccountHeads({ search: value.trim(), page: 1, limit: 10 });
    setResults(res.items.filter((a) => !a.locked && a.codes !== excludeAc));
  }

  function addAccount(account: AccountHead) {
    onChange([...lines, { ac: account.codes, amount: 0, description: account.description ?? '' }]);
    setQuery('');
    setResults([]);
  }

  function updateLine(index: number, changes: Partial<ReceiptPaymentLineInput>) {
    onChange(lines.map((l, i) => (i === index ? { ...l, ...changes } : l)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + (l.amount || 0), 0);

  return (
    <div data-testid="receipt-payment-form-line-table">
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
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr>
              <td colSpan={4} className="empty-state">
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
                  style={{ width: 120 }}
                  value={line.amount || ''}
                  disabled={disabled}
                  onChange={(e) => updateLine(i, { amount: Number(e.target.value) || 0 })}
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
              <td style={{ fontWeight: 600 }}>{total.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
