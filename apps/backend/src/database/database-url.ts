/**
 * Single source for Postgres connection string (Nest TypeORM + CLI DataSource).
 */
export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const host = process.env.DATABASE_HOST ?? 'localhost';
  const port = process.env.DATABASE_PORT ?? '5432';
  const user = process.env.DATABASE_USER ?? 'postgres';
  const pass = process.env.DATABASE_PASSWORD ?? 'postgres';
  const name = process.env.DATABASE_NAME ?? 'scanshield';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${encodeURIComponent(name)}`;
}
