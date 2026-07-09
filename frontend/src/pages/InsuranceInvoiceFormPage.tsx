import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insuranceInvoiceApi, InsuranceInvoiceLineInput } from '../api/insuranceInvoiceApi';
import { estimationApi, EstimationListItem } from '../api/jobApi';
import { salesApi, SalesInvoice } from '../api/salesApi';
import { ApiError } from '../api/client';
import { InsuranceInvoiceLineItemsEditor } from '../components/InsuranceInvoiceLineItemsEditor';

export function InsuranceInvoiceFormPage() {
  const navigate = useNavigate();

  const [estQuery, setEstQuery] = useState('');
  const [estResults, setEstResults] = useState<EstimationListItem[]>([]);
  const [selectedEst, setSelectedEst] = useState<EstimationListItem | null>(null);

  const [billQuery, setBillQuery] = useState('');
  const [billResults, setBillResults] = useState<SalesInvoice[]>([]);
  const [selectedBill, setSelectedBill] = useState<SalesInvoice | null>(null);

  const [invoiceDt, setInvoiceDt] = useState(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState('');
  const [custTel, setCustTel] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [excessAmount, setExcessAmount] = useState(0);
  const [addition, setAddition] = useState(0);
  const [less, setLess] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [lines, setLines] = useState<InsuranceInvoiceLineInput[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleEstSearch(value: string) {
    setEstQuery(value);
    if (!value.trim()) {
      setEstResults([]);
      return;
    }
    const res = await estimationApi.list({ customerName: value.trim(), page: 1, limit: 10 });
    setEstResults(res.items);
  }

  async function handleBillSearch(value: string) {
    setBillQuery(value);
    if (!value.trim()) {
      setBillResults([]);
      return;
    }
    const res = await salesApi.invoices({ customerName: value.trim(), page: 1, limit: 10 });
    setBillResults(res.items);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!selectedEst) nextErrors.estimation = 'Estimation is required.';
    if (!selectedBill) nextErrors.bill = 'Sales invoice is required.';
    if (!customerName.trim()) nextErrors.customerName = 'Customer/insurer name is required.';
    if (!invoiceDt) nextErrors.date = 'Invoice date is required.';
    if (lines.length === 0) nextErrors.lines = 'At least one line item is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      await insuranceInvoiceApi.create({
        invoiceDt,
        estimationNo: selectedEst!.estimationNo!,
        bill: selectedBill!.bill!,
        customerName: customerName.trim(),
        custTel: custTel.trim() || null,
        claimNumber: claimNumber.trim() || null,
        excessAmount,
        addition,
        less,
        remarks: remarks || null,
        lines
      });
      navigate('/insurance-invoices');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save insurance invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>New Insurance Invoice</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="insr-form-estimation">Estimation</label>
          <input
            id="insr-form-estimation"
            className={`form-input${errors.estimation ? ' has-error' : ''}`}
            placeholder="Search estimation by customer name..."
            value={selectedEst ? `${selectedEst.estimationNo} - ${selectedEst.customerName}` : estQuery}
            disabled={saving}
            onChange={(e) => {
              setSelectedEst(null);
              handleEstSearch(e.target.value);
            }}
          />
          {errors.estimation && <div className="field-error">{errors.estimation}</div>}
          {estResults.length > 0 && !selectedEst && (
            <div className="autocomplete-panel">
              {estResults.map((est) => (
                <div
                  key={est.id}
                  className="autocomplete-option"
                  onClick={() => {
                    setSelectedEst(est);
                    setEstResults([]);
                  }}
                >
                  {est.estimationNo} - {est.customerName} ({est.vehNo ?? 'no vehicle'})
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="insr-form-bill">Sales Invoice (Bill)</label>
          <input
            id="insr-form-bill"
            className={`form-input${errors.bill ? ' has-error' : ''}`}
            placeholder="Search sales invoice by customer name..."
            value={selectedBill ? `${selectedBill.bill} - ${selectedBill.customerName}` : billQuery}
            disabled={saving}
            onChange={(e) => {
              setSelectedBill(null);
              handleBillSearch(e.target.value);
            }}
          />
          {errors.bill && <div className="field-error">{errors.bill}</div>}
          {billResults.length > 0 && !selectedBill && (
            <div className="autocomplete-panel">
              {billResults.map((bill) => (
                <div
                  key={bill.id}
                  className="autocomplete-option"
                  onClick={() => {
                    setSelectedBill(bill);
                    setBillResults([]);
                  }}
                >
                  {bill.bill} - {bill.customerName} ({bill.net ?? 0})
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="insr-form-date">Invoice Date</label>
            <input
              id="insr-form-date"
              type="date"
              className={`form-input${errors.date ? ' has-error' : ''}`}
              value={invoiceDt}
              disabled={saving}
              onChange={(e) => setInvoiceDt(e.target.value)}
            />
            {errors.date && <div className="field-error">{errors.date}</div>}
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="insr-form-claim">Claim Number</label>
            <input
              id="insr-form-claim"
              className="form-input"
              value={claimNumber}
              disabled={saving}
              onChange={(e) => setClaimNumber(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="insr-form-customer">Insurer / Customer Name</label>
            <input
              id="insr-form-customer"
              className={`form-input${errors.customerName ? ' has-error' : ''}`}
              placeholder="Who this invoice is billed to"
              value={customerName}
              disabled={saving}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            {errors.customerName && <div className="field-error">{errors.customerName}</div>}
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="insr-form-tel">Phone</label>
            <input
              id="insr-form-tel"
              className="form-input"
              value={custTel}
              disabled={saving}
              onChange={(e) => setCustTel(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="insr-form-excess">Excess Amount</label>
            <input
              id="insr-form-excess"
              type="number"
              min={0}
              className="form-input"
              value={excessAmount}
              disabled={saving}
              onChange={(e) => setExcessAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="insr-form-addition">Addition</label>
            <input
              id="insr-form-addition"
              type="number"
              className="form-input"
              value={addition}
              disabled={saving}
              onChange={(e) => setAddition(Number(e.target.value) || 0)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="insr-form-less">Less</label>
            <input
              id="insr-form-less"
              type="number"
              className="form-input"
              value={less}
              disabled={saving}
              onChange={(e) => setLess(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="insr-form-remarks">Remarks</label>
          <input
            id="insr-form-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Line Items</label>
          <InsuranceInvoiceLineItemsEditor lines={lines} onChange={setLines} disabled={saving} />
          {errors.lines && <div className="field-error">{errors.lines}</div>}
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
            onClick={() => navigate('/insurance-invoices')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
