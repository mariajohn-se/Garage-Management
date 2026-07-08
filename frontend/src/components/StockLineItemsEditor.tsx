import { useState } from 'react';
import { itemApi, ItemLookup } from '../api/itemApi';
import { StockMovementLineInput } from '../api/inventoryApi';

interface StockLineItemsEditorProps {
  lines: StockMovementLineInput[];
  onChange: (lines: StockMovementLineInput[]) => void;
  godowns: Array<{ ocode: string; name: string }>;
  disabled?: boolean;
}

export function StockLineItemsEditor({ lines, onChange, godowns, disabled }: StockLineItemsEditorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ItemLookup[]>([]);

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setResults(await itemApi.help(value.trim()));
  }

  function addItem(item: ItemLookup) {
    onChange([
      ...lines,
      { itemCode: item.itemCode, qty: 1, rate: item.salesRate ?? 0, godownId: godowns[0]?.ocode ?? '' }
    ]);
    setQuery('');
    setResults([]);
  }

  function updateLine(index: number, changes: Partial<StockMovementLineInput>) {
    onChange(lines.map((l, i) => (i === index ? { ...l, ...changes } : l)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + l.qty * l.rate, 0);

  return (
    <div data-testid="stock-form-item-table">
      <div className="form-group" style={{ position: 'relative' }}>
        <label>Add Item</label>
        <input
          className="form-input"
          placeholder="Search item code or description..."
          value={query}
          disabled={disabled}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {results.length > 0 && (
          <div className="autocomplete-panel">
            {results.map((r) => (
              <div key={r.itemCode} className="autocomplete-option" onClick={() => addItem(r)}>
                {r.itemCode} - {r.description} ({r.salesRate ?? 0})
              </div>
            ))}
          </div>
        )}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Item Code</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Location</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-state">
                No items added yet.
              </td>
            </tr>
          )}
          {lines.map((line, i) => (
            <tr key={i}>
              <td>{line.itemCode}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  style={{ width: 80 }}
                  value={line.qty}
                  disabled={disabled}
                  onChange={(e) => updateLine(i, { qty: Number(e.target.value) })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  style={{ width: 100 }}
                  value={line.rate}
                  disabled={disabled}
                  onChange={(e) => updateLine(i, { rate: Number(e.target.value) })}
                />
              </td>
              <td>
                <select value={line.godownId} disabled={disabled} onChange={(e) => updateLine(i, { godownId: e.target.value })}>
                  {godowns.map((g) => (
                    <option key={g.ocode} value={g.ocode}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>{(line.qty * line.rate).toFixed(2)}</td>
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
              <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>
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
