#!/usr/bin/env node
/**
 * 1) POST /auth/register (or POST /auth/login on 409 conflict)
 * 2) Mints an API key via POST /auth/api-keys (Bearer JWT)
 * 3) Uploads apps/frontend/seed-data/*.txt as scans (scripts/seed-documents.mjs)
 *
 * Requires: API + Postgres + Redis reachable (e.g. docker compose up).
 * Env: SCANSHIELD_API_URL (default http://localhost:3000),
 *      DEV_SEED_EMAIL, DEV_SEED_PASSWORD.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedDocuments } from './seed-documents.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const apiUrl = (process.env.SCANSHIELD_API_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

const email = process.env.DEV_SEED_EMAIL ?? 'dev@scanshield.local';
const password = process.env.DEV_SEED_PASSWORD ?? 'devpassword123';

const registerRes = await fetch(`${apiUrl}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const registerData = await registerRes.json().catch(() => ({}));

let jwt;
if (registerRes.ok) {
  jwt = registerData.accessToken;
  if (!jwt || typeof jwt !== 'string') {
    console.error('No accessToken in register response');
    process.exit(1);
  }
} else if (registerRes.status === 409) {
  const loginRes = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok) {
    console.error(
      'Failed to log in:',
      typeof loginData.message === 'string' ? loginData.message : loginRes.statusText,
    );
    process.exit(1);
  }
  jwt = loginData.accessToken;
  if (!jwt || typeof jwt !== 'string') {
    console.error('No accessToken in login response');
    process.exit(1);
  }
} else {
  console.error(
    'Register failed:',
    typeof registerData.message === 'string'
      ? registerData.message
      : registerRes.statusText,
  );
  process.exit(1);
}

const keyRes = await fetch(`${apiUrl}/auth/api-keys`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
  },
});
const keyData = await keyRes.json().catch(() => ({}));
if (!keyRes.ok) {
  console.error(
    'Failed to mint API key:',
    typeof keyData.message === 'string' ? keyData.message : keyRes.statusText,
  );
  process.exit(1);
}

const apiKey = keyData.apiKey;
if (!apiKey || typeof apiKey !== 'string') {
  console.error('No apiKey in response');
  process.exit(1);
}

console.log(`API key minted (use for testing; do not commit): sk_…`);

await seedDocuments({
  apiUrl,
  apiKey,
  seedDir: join(repoRoot, 'apps/frontend/seed-data'),
});
