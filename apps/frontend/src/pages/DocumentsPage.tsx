import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createScan, deleteScan, listScans, type ScanSummary } from '../api';
import { useAuth } from '../auth-context';
import { riskLevelColor } from '../riskLevelColor';

type ScanStatusFilter = 'queued' | 'processing' | 'completed' | 'failed';

export function DocumentsPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ScanStatusFilter | ''>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadScans = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    setError(null);
    try {
      const rows = await listScans(token, statusFilter || undefined);
      const nextRows = statusFilter
        ? rows.filter((row) => row.status === statusFilter)
        : rows;
      setScans(nextRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scans');
    } finally {
      setListLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    void loadScans();
  }, [loadScans]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const text = content.trim();
    if (!text) {
      setError('Enter some text to scan.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const document_name =
        text.split('\n')[0]!.slice(0, 120) || `Scan ${new Date().toISOString()}`;
      const { id } = await createScan(token, { document_name, content: text });
      setContent('');
      void loadScans();
      navigate(`/documents/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(scan: ScanSummary) {
    if (!token || deletingId) return;
    const confirmed = window.confirm(`Delete "${scan.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(scan.id);
    setError(null);
    try {
      await deleteScan(token, scan.id);
      await loadScans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>Documents</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/api-keys">API keys</Link>
          <a href="/admin/queues" target="_blank" rel="noreferrer">
            Queue (Bull Board)
          </a>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <section>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Upload text</h2>
        <form onSubmit={onSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Paste plain text to scan for PII…"
            style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
          <div style={{ marginTop: 8 }}>
            <button type="submit" disabled={uploading}>
              {uploading ? 'Submitting…' : 'Upload and scan'}
            </button>
          </div>
        </form>
        {error ? (
          <p style={{ color: 'crimson', marginTop: 16 }} role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <section style={{ marginTop: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 0, fontSize: 18 }}>Your documents</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ScanStatusFilter | '')}
            >
              <option value="">All</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </label>
        </div>
        {listLoading ? (
          <p style={{ color: '#666', fontSize: 14 }}>Loading…</p>
        ) : scans.length === 0 ? (
          <p style={{ color: '#666', fontSize: 14 }}>No documents yet.</p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                  Name
                </th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                  Status
                </th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                  Findings
                </th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                  Risk
                </th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                  Uploaded
                </th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                    <Link to={`/documents/${s.id}`}>{s.name}</Link>
                  </td>
                  <td style={{ padding: '8px 0', verticalAlign: 'top' }}>{s.status}</td>
                  <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                    {s.status === 'completed' ? s.findingsCount : '—'}
                  </td>
                  <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                    <span style={{ fontWeight: 600, color: riskLevelColor(s.riskLevel) }}>
                      {s.status === 'queued' || s.status === 'processing' ? '—' : s.riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '8px 0', verticalAlign: 'top', color: '#555' }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 0', verticalAlign: 'top' }}>
                    <button
                      type="button"
                      onClick={() => void onDelete(s)}
                      disabled={deletingId !== null}
                    >
                      {deletingId === s.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
