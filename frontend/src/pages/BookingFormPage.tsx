import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { customerApi, Customer, vehicleApi, Vehicle } from '../api/partyApi';
import { estimationApi } from '../api/jobApi';
import { ApiError } from '../api/client';

export function BookingFormPage() {
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

  const [appDate, setAppDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
    if (!selectedCustomer) nextErrors.customer = 'Customer is required.';
    if (!selectedVehicle) nextErrors.vehicle = 'Vehicle is required.';
    if (!selectedStaff) nextErrors.staff = 'Advisor is required.';
    if (!appDate) nextErrors.date = 'Appointment date is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setApiError(null);
    setSaving(true);
    try {
      await bookingApi.create({
        appDate,
        customerId: selectedCustomer!.custId,
        customerName: selectedCustomer!.name,
        address: selectedCustomer!.address || null,
        mobile: selectedCustomer!.phone1 || selectedCustomer!.phone2 || null,
        vehicleId: selectedVehicle!.vehId,
        vehNo: selectedVehicle!.vehNo,
        engineNo: selectedVehicle!.engineNo,
        regType: selectedVehicle!.regType,
        make: selectedVehicle!.make,
        colour: selectedVehicle!.colour,
        manYear: selectedVehicle!.manYear,
        staffId: selectedStaff!.ocode,
        remarks: remarks || null
      });
      navigate('/bookings');
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Unable to save booking. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section-card" style={{ maxWidth: 800 }}>
      <h2>New Vehicle Booking</h2>
      {apiError && <div className="alert alert-error">{apiError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="booking-form-customer">Customer</label>
          <input
            id="booking-form-customer"
            className={`form-input${errors.customer ? ' has-error' : ''}`}
            placeholder="Search customer..."
            value={selectedCustomer ? selectedCustomer.name : custQuery}
            disabled={saving}
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
          <label htmlFor="booking-form-vehicle">Vehicle</label>
          <input
            id="booking-form-vehicle"
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
          <label htmlFor="booking-form-staff">Advisor</label>
          <input
            id="booking-form-staff"
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
          <label htmlFor="booking-form-date">Appointment Date &amp; Time</label>
          <input
            id="booking-form-date"
            type="datetime-local"
            className={`form-input${errors.date ? ' has-error' : ''}`}
            value={appDate}
            disabled={saving}
            onChange={(e) => setAppDate(e.target.value)}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="booking-form-remarks">Remarks</label>
          <input
            id="booking-form-remarks"
            className="form-input"
            value={remarks}
            disabled={saving}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <span className="spinner" />}
            Save
          </button>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => navigate('/bookings')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
