import { createHash } from 'crypto';

export function hashApiKey(plain: string): string {
  return createHash('sha256').update(plain, 'utf8').digest('hex');
}
