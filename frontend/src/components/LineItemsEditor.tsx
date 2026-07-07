import { useState } from 'react';
import { itemApi, ItemLookup } from '../api/itemApi';

export interface LineItem {
  itemCode: string;
  description?: string;
  qty: number;
  rate: number;
}

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  disabled?: boolean;
}

export function LineItemsEditor({ items, onChange, disabled }: LineItemsEditorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ItemLookup[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      setResults(await itemApi.help(value.trim()));
    } finally {
      setSearching(false);
    }
  }

  function addItem(item: ItemLookup) {
    onChange([
      ...items,
      { itemCode: item.itemCode, description: item.description ?? '', qty: 1, rate: item.salesRate ?? 0 }
    ]);
    setQuery('');
    setResults([]);
  }

  function updateItem(index: number, changes: Partial<LineItem>) {
    onChange(items.map((it, i) => (i === index ? { ...it, ...changes } : it)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  const total = items.reduce((sum, it) => sum + it.qty * it.rate, 0);

  return (
    <div data-testid="order-form-item-table">
      <div className="form-group" style={{ position: 'relative' }}>
        <label>Add Item</label>
        <input
          data-testid="order-form-add-item"
          className="form-input"
          placeholder="Search item code or description..."
          value={query}
          disabled={disabled}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searching && <div className="field-error">Searching...</div>}
        {results.length > 0 && (
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
            {results.map((r) => (
              <div
                key={r.itemCode}
                style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}
                onClick={() => addItem(r)}
              >
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
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-state">
                No items added yet.
              </td>
            </tr>
          )}
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.itemCode}</td>
              <td>{item.description}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  style={{ width: 80 }}
                  value={item.qty}
                  disabled={disabled}
                  onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  style={{ width: 100 }}
                  value={item.rate}
                  disabled={disabled}
                  onChange={(e) => updateItem(i, { rate: Number(e.target.value) })}
                />
              </td>
              <td>{(item.qty * item.rate).toFixed(2)}</td>
              <td>
                <button type="button" className="btn-outline" disabled={disabled} onClick={() => removeItem(i)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {items.length > 0 && (
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
