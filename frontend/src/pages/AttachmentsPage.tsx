import { useEffect, useRef, useState } from 'react';
import { attachmentApi, Attachment } from '../api/documentApi';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../hooks/useAuth';

const LIMIT = 25;

export function AttachmentsPage() {
  const { session } = useAuth();
  const canDelete = session?.roles.some((r) => r === 'Supervisor' || r === 'Administrator');
  const [items, setItems] = useState<Attachment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [codes, setCodes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [type, setType] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    setError(null);
    attachmentApi
      .list({ page, limit: LIMIT })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Unable to load attachments. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setBanner(null);
    setError(null);
    try {
      await attachmentApi.upload(file, {
        type: type || undefined,
        codes: codes || undefined,
        remarks: remarks || undefined
      });
      setBanner('Attachment uploaded.');
      setCodes('');
      setRemarks('');
      setType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    setBanner(null);
    try {
      await attachmentApi.remove(id);
      load();
    } catch {
      setError('Unable to delete attachment.');
    }
  }

  return (
    <div className="section-card" data-testid="attachments-table">
      <h2>Attachments</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Historical attachments point to local file paths from the original desktop app and can't be downloaded here (see
        README.md) - new uploads are stored on this server and are fully downloadable.
      </p>

      <div data-testid="attachments-upload-panel" className="filter-bar">
        <input ref={fileInputRef} type="file" data-testid="attachments-file-input" />
        <input
          placeholder="Type"
          data-testid="attachments-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <input
          placeholder="Linked code / reference"
          data-testid="attachments-codes"
          value={codes}
          onChange={(e) => setCodes(e.target.value)}
        />
        <input
          placeholder="Remarks"
          data-testid="attachments-remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <button
          className="btn-primary"
          data-testid="attachments-upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading && <span className="spinner" />}
          Upload
        </button>
      </div>

      {banner && <div className="alert alert-success">{banner}</div>}
      {error && (
        <div className="error-state" data-testid="attachments-error">
          {error}
        </div>
      )}

      {!error && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Linked Code</th>
                <th>Remarks</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan={5} />
                  </tr>
                ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state" data-testid="attachments-empty">
                    No attachments found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((a) => (
                  <tr key={a.id}>
                    <td>{a.type ?? '—'}</td>
                    <td>{a.codes ?? '—'}</td>
                    <td>{a.remarks ?? '—'}</td>
                    <td>
                      {a.isLegacyPath ? (
                        <span title={a.path ?? ''} style={{ color: 'var(--color-text-muted)' }}>
                          Unavailable (legacy path)
                        </span>
                      ) : (
                        <a href={`/api/v1/attachments/${a.id}/download`} data-testid={`attachments-view-btn-${a.id}`}>
                          Download
                        </a>
                      )}
                    </td>
                    <td>
                      {canDelete && (
                        <button className="btn-danger" onClick={() => handleDelete(a.id)}>
                          Delete
                        </button>
                      )}
                    </td>
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
