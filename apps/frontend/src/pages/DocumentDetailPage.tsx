import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getScan, type ScanDetail } from '../api';
import { useAuth } from '../auth-context';
import { riskLevelColor } from '../riskLevelColor';
import { maskByFindingType } from '../sensitiveDisplay';

function highlightContent(
  text: string,
  findings: Array<{ type: string; value: string; position: number }>,
): ReactNode[] {
  if (findings.length === 0) {
    return [text];
  }
  const sorted = [...findings].sort((a, b) => a.position - b.position);
  const parts: ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((f, i) => {
    const start = f.position;
    const end = start + f.value.length;
    if (start > cursor) {
      parts.push(text.slice(cursor, start));
    }
    parts.push(
      <mark
        key={`${start}-${i}`}
        style={{ backgroundColor: '#fff3cd', padding: '0 2px' }}
      >
        {maskByFindingType(f.type, f.value)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }
  return parts;
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [doc, setDoc] = useState<ScanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    const authToken = token;
    const docId = id;

    let cancelled = false;

    async function load() {
      try {
        const data = await getScan(authToken, docId);
        if (cancelled) return;
        setDoc(data);
        setError(null);
        if (data.status === 'completed' || data.status === 'failed') {
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

  const highlightedBody = useMemo(() => {
    if (!doc?.findings?.length) {
      return doc?.content ?? '';
    }
    return highlightContent(doc.content, doc.findings);
  }, [doc]);

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
    <div style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
      <p style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link to="/documents">← Documents</Link>
        <Link to="/api-keys">API keys</Link>
        <a href="/admin/queues" target="_blank" rel="noreferrer">
          Queue (Bull Board)
        </a>
      </p>
      <h1>{doc.name}</h1>
      <p>
        Status: <strong>{doc.status}</strong>
      </p>
      <p>
        Risk:{' '}
        {pending ? (
          <span style={{ color: '#666' }}>— (assigned when scan completes)</span>
        ) : (
          <strong style={{ color: riskLevelColor(doc.riskLevel ?? 'clean') }}>
            {doc.riskLevel ?? 'clean'}
          </strong>
        )}
      </p>
      {pending ? (
        <p style={{ color: '#666', fontSize: 14 }}>Refreshing status…</p>
      ) : null}

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Document text</h2>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'inherit',
            fontSize: 14,
            lineHeight: 1.5,
            padding: 12,
            background: '#f8f8f8',
            border: '1px solid #e0e0e0',
            borderRadius: 4,
            maxHeight: 360,
            overflow: 'auto',
          }}
        >
          {doc.status === 'completed' && doc.findings?.length ? highlightedBody : doc.content}
        </pre>
      </section>

      {doc.status === 'completed' && doc.findings ? (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18 }}>Findings ({doc.findings.length})</h2>
          {doc.findings.length === 0 ? (
            <p>No PII matches.</p>
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
                    Offset
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
                      {maskByFindingType(f.type, f.value)}
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
