import { FormEvent, useEffect, useState } from 'react';
import { jobApi, AssignedJobItem } from '../api/jobApi';
import { userApi } from '../api/userApi';
import { ApiError } from '../api/client';
import { Pagination } from '../components/Pagination';

const LIMIT = 25;

export function AssignedJobsPage() {
  const [items, setItems] = useState<AssignedJobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [ordr, setOrdr] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignOrdr, setAssignOrdr] = useState('');
  const [empQuery, setEmpQuery] = useState('');
  const [empResults, setEmpResults] = useState<Array<{ empId: number; name: string }>>([]);
  const [selectedEmp, setSelectedEmp] = useState<{ empId: number; name: string } | null>(null);
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({});
  const [assignError, setAssignError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    jobApi
      .listAssigned({ ordr, page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load assigned jobs. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [ordr, page]);

  async function handleEmpSearch(value: string) {
    setEmpQuery(value);
    if (!value.trim()) {
      setEmpResults([]);
      return;
    }
    setEmpResults(await userApi.employeeHelp(value.trim()));
  }

  async function handleAssign(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!assignOrdr.trim()) nextErrors.ordr = 'Order # is required.';
    if (!selectedEmp) nextErrors.emp = 'Staff is required.';
    setAssignErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setAssignError(null);
    setBanner(null);
    setAssigning(true);
    try {
      await jobApi.assign(assignOrdr.trim(), selectedEmp!.empId);
      setBanner(`Assigned ${selectedEmp!.name} to order ${assignOrdr.trim()}.`);
      setAssignOrdr('');
      setSelectedEmp(null);
      setEmpQuery('');
      load();
    } catch (err) {
      setAssignError(err instanceof ApiError ? err.message : 'Unable to assign staff. Please try again.');
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="section-card">
      <h2>Assigned Jobs</h2>

      <form data-testid="assign-staff-form" onSubmit={handleAssign} noValidate style={{ marginBottom: 'var(--space-6)' }}>
        {banner && <div className="alert alert-success">{banner}</div>}
        {assignError && <div className="alert alert-error">{assignError}</div>}
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="assign-ordr">Order #</label>
            <input
              id="assign-ordr"
              data-testid="assign-ordr"
              className={`form-input${assignErrors.ordr ? ' has-error' : ''}`}
              value={assignOrdr}
              disabled={assigning}
              onChange={(e) => setAssignOrdr(e.target.value)}
            />
            {assignErrors.ordr && <div className="field-error">{assignErrors.ordr}</div>}
          </div>
          <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
            <label htmlFor="assign-emp">Staff</label>
            <input
              id="assign-emp"
              data-testid="assign-emp"
              className={`form-input${assignErrors.emp ? ' has-error' : ''}`}
              placeholder="Search staff..."
              value={selectedEmp ? selectedEmp.name : empQuery}
              disabled={assigning}
              onChange={(e) => {
                setSelectedEmp(null);
                handleEmpSearch(e.target.value);
              }}
            />
            {assignErrors.emp && <div className="field-error">{assignErrors.emp}</div>}
            {empResults.length > 0 && !selectedEmp && (
              <div className="autocomplete-panel">
                {empResults.map((emp) => (
                  <div
                    key={emp.empId}
                    className="autocomplete-option"
                    onClick={() => {
                      setSelectedEmp(emp);
                      setEmpResults([]);
                    }}
                  >
                    {emp.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" data-testid="assign-staff-submit" className="btn-primary" style={{ width: 'auto' }} disabled={assigning}>
            {assigning && <span className="spinner" />}
            Assign
          </button>
        </div>
      </form>

      <div className="filter-bar">
        <input
          placeholder="Order #..."
          value={ordr}
          onChange={(e) => {
            setPage(1);
            setOrdr(e.target.value);
          }}
        />
      </div>

      {error && <div className="error-state">{error}</div>}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Employee</th>
                <th>Date Assigned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={4} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No assigned jobs match current filters.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((a) => (
                  <tr key={a.dtlId}>
                    <td>{a.ordr}</td>
                    <td>{a.empName ?? '—'}</td>
                    <td>{a.dateOfAssign ? new Date(a.dateOfAssign).toLocaleString() : '—'}</td>
                    <td>{a.status ?? '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
