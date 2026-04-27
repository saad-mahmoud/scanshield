const baseUrl = import.meta.env.VITE_API_URL ?? '';

function errorFromBody(data: unknown, fallback: string): string {
  return typeof (data as { message?: unknown })?.message === 'string'
    ? (data as { message: string }).message
    : fallback;
}

function headers(token: string, init?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...init,
  };
}

export async function register(
  email: string,
  password: string,
): Promise<{ accessToken: string }> {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorFromBody(data, res.statusText));
  }
  return data as { accessToken: string };
}

export async function login(
  email: string,
  password: string,
): Promise<{ accessToken: string }> {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorFromBody(data, res.statusText));
  }
  return data as { accessToken: string };
}

export type ApiKeyRow = {
  id: string;
  keyPrefix: string | null;
  createdAt: string;
};

export async function listApiKeys(token: string): Promise<ApiKeyRow[]> {
  const res = await fetch(`${baseUrl}/auth/api-keys`, {
    headers: headers(token),
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(errorFromBody(data, res.statusText));
  }
  return data as ApiKeyRow[];
}

export async function createApiKey(token: string): Promise<{
  id: string;
  apiKey: string;
  keyPrefix: string;
  createdAt: string;
}> {
  const res = await fetch(`${baseUrl}/auth/api-keys`, {
    method: 'POST',
    headers: headers(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorFromBody(data, res.statusText));
  }
  return data as {
    id: string;
    apiKey: string;
    keyPrefix: string;
    createdAt: string;
  };
}

export async function revokeApiKey(
  token: string,
  keyId: string,
): Promise<void> {
  const res = await fetch(
    `${baseUrl}/auth/api-keys/${encodeURIComponent(keyId)}`,
    {
      method: 'DELETE',
      headers: headers(token),
    },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(errorFromBody(data, res.statusText));
  }
}

export async function createScan(
  token: string,
  body: { document_name: string; content: string },
): Promise<{ documentId: string; id: string; status: string }> {
  const res = await fetch(`${baseUrl}/api/v1/scans`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorFromBody(data, res.statusText));
  }
  return data as { documentId: string; id: string; status: string };
}

export type ScanSummary = {
  id: string;
  name: string;
  status: string;
  riskLevel: string;
  createdAt: string;
  findingsCount: number;
};

export async function listScans(
  token: string,
  status?: 'queued' | 'processing' | 'completed' | 'failed',
): Promise<ScanSummary[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${baseUrl}/api/v1/scans${query}`, {
    headers: headers(token),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(errorFromBody(data, res.statusText));
  }
  return data as ScanSummary[];
}

export type ScanDetail = {
  id: string;
  name: string;
  content: string;
  status: string;
  riskLevel: string;
  findings?: Array<{ type: string; value: string; position: number }>;
};

export async function getScan(token: string, id: string): Promise<ScanDetail> {
  const res = await fetch(`${baseUrl}/api/v1/scans/${encodeURIComponent(id)}`, {
    headers: headers(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorFromBody(data, res.statusText));
  }
  return data as ScanDetail;
}
