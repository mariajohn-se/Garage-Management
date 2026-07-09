import { InsuranceInvoiceLineInput } from '../api/insuranceInvoiceApi';

interface InsuranceInvoiceLineItemsEditorProps {
  lines: InsuranceInvoiceLineInput[];
  onChange: (lines: InsuranceInvoiceLineInput[]) => void;
  disabled?: boolean;
}

export function InsuranceInvoiceLineItemsEditor({ lines, onChange, disabled }: InsuranceInvoiceLineItemsEditorProps) {
  function addLine() {
    onChange([...lines, { description: '', qty: 1, unitPrice: 0 }]);
  }

  function updateLine(index: number, changes: Partial<InsuranceInvoiceLineInput>) {
    onChange(lines.map((l, i) => (i === index ? { ...l, ...changes } : l)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);

  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-state">
                No line items added yet.
              </td>
            </tr>
          )}
          {lines.map((line, i) => (
            <tr key={i}>
              <td>
                <input
                  className="form-input"
                  placeholder="Repair / part description..."
                  value={line.description}
                  disabled={disabled}
                  onChange={(e) => updateLine(i, { description: e.target.value })}
                />
              </td>
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
                  style={{ width: 110 }}
                  value={line.unitPrice}
                  disabled={disabled}
                  onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                />
              </td>
              <td>{(line.qty * line.unitPrice).toFixed(2)}</td>
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
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>
                Total
              </td>
              <td style={{ fontWeight: 600 }}>{total.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
      <button type="button" className="btn-outline" disabled={disabled} onClick={addLine} style={{ marginTop: 'var(--space-2)' }}>
        + Add Line
      </button>
    </div>
  );
}
