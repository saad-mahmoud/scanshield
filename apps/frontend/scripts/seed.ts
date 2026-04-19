import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const seedDir = join(scriptDir, '..', 'seed-data');

const apiUrl =
  process.env.SCANSHIELD_API_URL ??
  process.env.VITE_API_URL ??
  'http://localhost:3000';
const apiKey = process.env.SCANSHIELD_API_KEY;

async function main(): Promise<void> {
  if (!apiKey?.trim()) {
    console.error(
      'Missing SCANSHIELD_API_KEY. Log in via the UI, create an API key on /api-keys, or run pnpm seed from the repo root.',
    );
    process.exit(1);
  }

  const { seedDocuments } = await import(
    new URL('../../../scripts/seed-documents.mjs', import.meta.url).href
  );

  await seedDocuments({ apiUrl, apiKey, seedDir });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
