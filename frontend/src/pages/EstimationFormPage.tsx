import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { estimationApi, EstimationLineInput } from '../api/jobApi';
import { customerApi, Customer, vehicleApi, Vehicle } from '../api/partyApi';
import { ApiError } from '../api/client';
import { EstimationLineItemsEditor } from '../components/EstimationLineItemsEditor';

export function EstimationFormPage() {
  const { estimationId } = useParams();
  const isEdit = Boolean(estimationId);
  const navigate = useNavigate();

  const [custQuery, setCustQuery] = useState('');
  const [custResults, setCustResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [vehQuery, setVehQuery] = useState('');
  const [vehResults, setVehResults] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [staffQuery, setStaffQuery] = useState('');
  const [staffResults, setStaffResults] = useState<Array<{ ocode: string; name: string }>>([]);
  const [selectedStaff, setSelectedStaff] = useState<{ ocode: string; name: string } | null>(null);

  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));
  const [jobCardNo, setJobCardNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [addition, setAddition] = useState(0);
  const [less, setLess] = useState(0);
  const [lines, setLines] = useState<EstimationLineInput[]>([]);
  const [locked, setLocked] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!estimationId) return;
    estimationApi
      .get(Number(estimationId))
      .then((e) => {
        setSelectedCustomer({
          custId: e.customerId ?? '',
          name: e.customerName ?? '',
          address: '',
          emirate: null,
          contactPerson: null,
          phone1: null,
          phone2: null,
          email: null,
          area: null,
          isActive: true,
          remarks: null
        });
        setSelectedVehicle(
          e.vehicleId ? ({ vehId: e.vehicleId, vehNo: e.vehNo } as Vehicle) : null
        );
        setSelectedStaff(e.staffId ? { ocode: e.staffId, name: e.staffName ?? '' } : null);
        setJobCardNo(e.jobCardNo ?? '');
        setRemarks(e.remarks ?? '');
        setLines(
          e.lines.map((l) => ({
            description: l.description ?? '',
            qty: l.qty ?? 0,
            unitPrice: l.unitPrice ?? 0,
            labourAmount: l.labourAmount ?? 0
          }))
        );
        setLocked(e.approved);
      })
      .catch((err) => setApiError(err instanceof ApiError ? err.message : 'Unable to load estimation.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimationId]);

  async function handleCustomerSearch(value: string) {
    setCustQuery(value);
    if (!value.trim()) {
      setCustResults([]);
      return;
    }
    setCustResults(await customerApi.help(value.trim()));
  }

  async function handleVehicleSearch(value: string) {
    setVehQuery(value);
    if (!value.trim()) {
      setVehResults([]);
      return;
    }
    const res = await vehicleApi.list({ search: value.trim(), page: 1, limit: 10 });
    setVehResults(res.items);
  }

  async function handleStaffSearch(value: string) {
    setStaffQuery(value);
    if (!value.trim()) {
      setStaffResults([]);
      return;
    }
    setStaffResults(await estimationApi.staffHelp(value.trim()));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!isEdit && !selectedCustomer) nextErrors.customer = 'Customer is required.';
    if (!selectedVehicle) nextErrors.vehicle = 'Vehicle is required.';
    if (!selectedStaff) nextErrors.staff = 'Advisor is required.';
    if (!billDate) nextErrors.date = 'Bill date is required.';
    if (lines.length === 0) nextErrors.lines = 'At least one line item is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await estimationApi.update(Number(estimationId), {
          vehicleId: selectedVehicle!.vehId || undefined,
          staffId: selectedStaff!.ocode || undefined,
          remarks: remarks || null,
          addition,
          less,
          lines: locked ? undefined : lines
        });
      } else {
        await estimationApi.create({
          customerId: selectedCustomer!.custId,
          vehicleId: selectedVehicle!.vehId,
          staffId: selectedStaff!.ocode,
          billDate,
          jobCardNo: jobCardNo.trim() || null,
          remarks: remarks || null,
          addition,
          less,
          lines
        });
      }
      navigate('/estimations');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save estimation. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="section-card empty-state">Loading...</div>;

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>{isEdit ? 'Edit Estimation' : 'New Estimation'}</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}
      {locked && (
        <div className="alert alert-error">This estimation has been approved - line items can no longer be edited.</div>
      )}

      <form data-testid="estimation-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="estimation-form-customer">Customer</label>
          <input
            id="estimation-form-customer"
            data-testid="estimation-form-customer"
            className={`form-input${errors.customer ? ' has-error' : ''}`}
            placeholder="Search customer..."
            value={selectedCustomer ? selectedCustomer.name : custQuery}
            disabled={saving || isEdit}
            onChange={(e) => {
              setSelectedCustomer(null);
              handleCustomerSearch(e.target.value);
            }}
          />
          {errors.customer && <div className="field-error">{errors.customer}</div>}
          {custResults.length > 0 && !selectedCustomer && (
            <div className="autocomplete-panel">
              {custResults.map((c) => (
                <div
                  key={c.custId}
                  className="autocomplete-option"
                  onClick={() => {
                    setSelectedCustomer(c);
                    setCustResults([]);
                  }}
                >
                  {c.name} ({c.phone1 || c.phone2 || 'no phone'})
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="estimation-form-vehicle">Vehicle</label>
          <input
            id="estimation-form-vehicle"
            data-testid="estimation-form-vehicle"
            className={`form-input${errors.vehicle ? ' has-error' : ''}`}
            placeholder="Search vehicle no..."
            value={selectedVehicle ? selectedVehicle.vehNo ?? '' : vehQuery}
            disabled={saving}
            onChange={(e) => {
              setSelectedVehicle(null);
              handleVehicleSearch(e.target.value);
            }}
          />
          {errors.vehicle && <div className="field-error">{errors.vehicle}</div>}
          {vehResults.length > 0 && !selectedVehicle && (
            <div className="autocomplete-panel">
              {vehResults.map((v) => (
                <div
                  key={v.vehId}
                  className="autocomplete-option"
                  onClick={() => {
                    setSelectedVehicle(v);
                    setVehResults([]);
                  }}
                >
                  {v.vehNo} ({v.make || 'unknown make'})
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="estimation-form-staff">Advisor</label>
          <input
            id="estimation-form-staff"
            data-testid="estimation-form-staff"
            className={`form-input${errors.staff ? ' has-error' : ''}`}
            placeholder="Search advisor..."
            value={selectedStaff ? selectedStaff.name : staffQuery}
            disabled={saving}
            onChange={(e) => {
              setSelectedStaff(null);
              handleStaffSearch(e.target.value);
            }}
          />
          {errors.staff && <div className="field-error">{errors.staff}</div>}
          {staffResults.length > 0 && !selectedStaff && (
            <div className="autocomplete-panel">
              {staffResults.map((s) => (
                <div
                  key={s.ocode}
                  className="autocomplete-option"
                  onClick={() => {
                    setSelectedStaff(s);
                    setStaffResults([]);
                  }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="estimation-form-date">Bill Date</label>
          <input
            id="estimation-form-date"
            type="date"
            className={`form-input${errors.date ? ' has-error' : ''}`}
            value={billDate}
            disabled={saving || isEdit}
            onChange={(e) => setBillDate(e.target.value)}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        {!isEdit && (
          <div className="form-group">
            <label htmlFor="estimation-form-jobcard">Job Card # (optional)</label>
            <input
              id="estimation-form-jobcard"
              data-testid="estimation-form-jobcard"
              className="form-input"
              placeholder="Leave blank if not linked to a job card yet"
              value={jobCardNo}
              disabled={saving}
              onChange={(e) => setJobCardNo(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="estimation-form-remarks">Remarks</label>
          <input
            id="estimation-form-remarks"
            data-testid="estimation-form-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="estimation-form-addition">Addition</label>
            <input
              id="estimation-form-addition"
              type="number"
              className="form-input"
              value={addition}
              disabled={saving || locked}
              onChange={(e) => setAddition(Number(e.target.value))}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="estimation-form-less">Less</label>
            <input
              id="estimation-form-less"
              type="number"
              className="form-input"
              value={less}
              disabled={saving || locked}
              onChange={(e) => setLess(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Line Items</label>
          <EstimationLineItemsEditor lines={lines} onChange={setLines} disabled={saving || locked} />
          {errors.lines && <div className="field-error">{errors.lines}</div>}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="submit" data-testid="estimation-form-save" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => navigate('/estimations')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
