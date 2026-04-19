import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDocument, type DocumentDetail } from '../api';
import { useAuth } from '../auth-context';

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    const authToken = token;
    const docId = id;

    let cancelled = false;

    async function load() {
      try {
        const data = await getDocument(authToken, docId);
        if (cancelled) return;
        setDoc(data);
        setError(null);
        if (data.status === 'done' || data.status === 'failed') {
          if (pollRef.current !== null) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (err) {
        if (pollRef.current !== null) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      }
    }

    void load();
    pollRef.current = setInterval(() => void load(), 2500);
    return () => {
      cancelled = true;
      if (pollRef.current !== null) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [token, id]);

  if (!id) {
    return <p>Missing id</p>;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'crimson' }}>{error}</p>
        <Link to="/documents">Back</Link>
      </div>
    );
  }

  if (!doc) {
    return <p style={{ padding: 24 }}>Loading…</p>;
  }

  const pending =
    doc.status === 'queued' || doc.status === 'processing';

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <p>
        <Link to="/documents">← Documents</Link>
      </p>
      <h1>{doc.name}</h1>
      <p>
        Status: <strong>{doc.status}</strong>
      </p>
      {pending ? (
        <p style={{ color: '#666', fontSize: 14 }}>Refreshing status…</p>
      ) : null}

      {doc.status === 'done' && doc.findings ? (
        <section style={{ marginTop: 24 }}>
          <h2>Findings ({doc.findings.length})</h2>
          {doc.findings.length === 0 ? (
            <p>No matches.</p>
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
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    Type
                  </th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    Value
                  </th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                    Position
                  </th>
                </tr>
              </thead>
              <tbody>
                {doc.findings.map((f, i) => (
                  <tr key={`${f.position}-${i}`}>
                    <td style={{ padding: '6px 0', verticalAlign: 'top' }}>
                      {f.type}
                    </td>
                    <td
                      style={{
                        padding: '6px 0',
                        wordBreak: 'break-all',
                        verticalAlign: 'top',
                      }}
                    >
                      {f.value}
                    </td>
                    <td style={{ padding: '6px 0', verticalAlign: 'top' }}>
                      {f.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      {doc.status === 'failed' ? (
        <p style={{ color: 'crimson' }}>Scan failed.</p>
      ) : null}
    </div>
  );
}
