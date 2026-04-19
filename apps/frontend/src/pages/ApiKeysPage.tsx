import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type ApiKeyRow,
} from '../api';
import { useAuth } from '../auth-context';

export function ApiKeysPage() {
  const { token, logout } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await listApiKeys(token);
      setKeys(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keys');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate() {
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const created = await createApiKey(token);
      await load();
      window.alert(
        `Copy your new API key now (shown once):\n\n${created.apiKey}\n\nStore it securely.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  }

  async function onRevoke(id: string) {
    if (!token) return;
    if (!window.confirm('Revoke this API key? Scripts using it will stop working.')) {
      return;
    }
    setError(null);
    try {
      await revokeApiKey(token, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke');
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
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>API keys</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/documents">Documents</Link>
          <a href="/admin/queues" target="_blank" rel="noreferrer">
            Queue (Bull Board)
          </a>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <p style={{ color: '#555', fontSize: 14 }}>
        Use API keys with{' '}
        <code style={{ fontSize: 13 }}>Authorization: Bearer &lt;api_key&gt;</code> on{' '}
        <code style={{ fontSize: 13 }}>POST/GET /api/v1/scans</code> without using the browser session.
      </p>

      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => void onCreate()} disabled={creating}>
          {creating ? 'Creating…' : 'Create new API key'}
        </button>
      </div>

      {error ? (
        <p style={{ color: 'crimson' }} role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p style={{ color: '#666' }}>Loading…</p>
      ) : keys.length === 0 ? (
        <p style={{ color: '#666' }}>No API keys yet.</p>
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
                Prefix
              </th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                Created
              </th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 0' }}>
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 13 }}>
                  {k.keyPrefix ?? '—'}
                </td>
                <td style={{ padding: '8px 0', color: '#555' }}>
                  {new Date(k.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '8px 0' }}>
                  <button type="button" onClick={() => void onRevoke(k.id)}>
                    Revoke
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
