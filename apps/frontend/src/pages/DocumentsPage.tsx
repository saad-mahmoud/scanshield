import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  createDocument,
  listDocuments,
  type DocumentSummary,
} from '../api';
import { useAuth } from '../auth-context';

export function DocumentsPage() {
  const { token, logout } = useAuth();
  const [items, setItems] = useState<DocumentSummary[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await listDocuments(token);
      setItems(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

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
      const name =
        text.split('\n')[0]!.slice(0, 120) || `Scan ${new Date().toISOString()}`;
      await createDocument(token, { name, content: text });
      setContent('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>Documents</h1>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2>New scan</h2>
        <form onSubmit={onSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Paste text to scan for sensitive data…"
            style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
          <div style={{ marginTop: 8 }}>
            <button type="submit" disabled={uploading}>
              {uploading ? 'Submitting…' : 'Submit scan'}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2>Your documents</h2>
        {error ? (
          <p style={{ color: 'crimson' }} role="alert">
            {error}
          </p>
        ) : null}
        {loading ? <p>Loading…</p> : null}
        {!loading && items.length === 0 ? <p>No documents yet.</p> : null}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((d) => (
            <li
              key={d.id}
              style={{
                borderBottom: '1px solid #ddd',
                padding: '8px 0',
              }}
            >
              <Link to={`/documents/${d.id}`}>{d.name}</Link>
              {' — '}
              <span>{d.status}</span>
              <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>
                {new Date(d.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
