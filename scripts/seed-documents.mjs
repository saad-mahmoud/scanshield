import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

/**
 * POST each .txt file in seedDir to POST /api/v1/scans with Bearer apiKey.
 */
export async function seedDocuments({ apiUrl, apiKey, seedDir }) {
  const base = apiUrl.replace(/\/$/, '');

  async function seedFile(filePath, fileName) {
    const content = await readFile(filePath, 'utf8');
    const document_name = basename(fileName, '.txt');

    const res = await fetch(`${base}/api/v1/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ document_name, content }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        typeof data.message === 'string'
          ? data.message
          : `${res.status} ${res.statusText}`,
      );
    }

    const documentId = data.documentId ?? data.id;
    if (!documentId || !data.status) {
      throw new Error(`Unexpected response for ${fileName}`);
    }

    return { documentId, id: documentId, status: data.status };
  }

  let entries;
  try {
    entries = await readdir(seedDir, { withFileTypes: true });
  } catch (e) {
    if (e?.code === 'ENOENT') {
      throw new Error(`Seed directory not found: ${seedDir}`);
    }
    throw e;
  }

  const txtFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith('.txt'))
    .map((e) => e.name)
    .sort();

  if (txtFiles.length === 0) {
    console.log(`No .txt files in ${seedDir}; nothing to seed.`);
    return;
  }

  console.log(`API: ${base}`);
  for (const fileName of txtFiles) {
    const filePath = join(seedDir, fileName);
    const { documentId, status } = await seedFile(filePath, fileName);
    console.log(`${fileName} -> document ${documentId} (${status})`);
  }
}
