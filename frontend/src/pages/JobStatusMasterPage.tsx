import { useEffect, useState } from 'react';
import { jobStatusMasterApi, JobStatus } from '../api/jobApi';
import { ApiError } from '../api/client';

export function JobStatusMasterPage() {
  const [items, setItems] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    jobStatusMasterApi
      .list()
      .then(setItems)
      .catch(() => setError('Unable to load job statuses. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAdd() {
    if (!newDescription.trim()) return;
    setSaving(true);
    setBanner(null);
    try {
      await jobStatusMasterApi.create({
        description: newDescription.trim(),
        finishedStatus: false,
        partsNotAvailable: false,
        inProgress: false,
        foreColour: null,
        backColour: null,
        assigned: false,
        approved: false,
        sortOrder: items.length + 1
      });
      setNewDescription('');
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to add status.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(statusId: number) {
    setBanner(null);
    try {
      await jobStatusMasterApi.remove(statusId);
      load();
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Unable to delete status.');
    }
  }

  return (
    <div className="section-card">
      <h2>Job Status Master</h2>

      <div className="filter-bar">
        <input
          data-testid="statusmaster-new-description"
          placeholder="New status description..."
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <button className="btn-primary" data-testid="statusmaster-add-btn" onClick={handleAdd} disabled={saving}>
          Add
        </button>
      </div>

      {banner && <div className="alert alert-error">{banner}</div>}
      {error && <div className="error-state">{error}</div>}

      {!error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Finished</th>
              <th>In Progress</th>
              <th>Sort Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={5} />
                </tr>
              ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">
                  No statuses defined.
                </td>
              </tr>
            )}
            {!loading &&
              items.map((s) => (
                <tr key={s.statusId}>
                  <td>{s.description}</td>
                  <td>{s.finishedStatus ? 'Yes' : 'No'}</td>
                  <td>{s.inProgress ? 'Yes' : 'No'}</td>
                  <td>{s.sortOrder ?? '—'}</td>
                  <td>
                    <button className="btn-outline" onClick={() => handleDelete(s.statusId)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
