const baseUrl = import.meta.env.VITE_API_URL ?? '';

function headers(token: string, init?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...init,
  };
}

export async function createApiKey(
  email: string,
  password: string,
): Promise<{ apiKey: string }> {
  const res = await fetch(`${baseUrl}/auth/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : res.statusText);
  }
  return data as { apiKey: string };
}

export type DocumentSummary = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
};

export async function listDocuments(token: string): Promise<DocumentSummary[]> {
  const res = await fetch(`${baseUrl}/api/v1/scans`, {
    headers: headers(token),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      typeof data?.message === 'string' ? data.message : res.statusText,
    );
  }
  return data as DocumentSummary[];
}

export async function createDocument(
  token: string,
  body: { name: string; content: string },
): Promise<{ documentId: string; status: string }> {
  const res = await fetch(`${baseUrl}/api/v1/scans`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : res.statusText);
  }
  return data as { documentId: string; status: string };
}

export type DocumentDetail = {
  id: string;
  name: string;
  status: string;
  findings?: Array<{ type: string; value: string; position: number }>;
};

export async function getDocument(
  token: string,
  id: string,
): Promise<DocumentDetail> {
  const res = await fetch(`${baseUrl}/api/v1/scans/${encodeURIComponent(id)}`, {
    headers: headers(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : res.statusText);
  }
  return data as DocumentDetail;
}
