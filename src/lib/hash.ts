import { canonicalize } from './canonical';
import { createHash } from 'crypto';

export function sha256Canonical(obj: any): string {
  const canonical = canonicalize(obj);
  return createHash('sha256').update(Buffer.from(canonical, 'utf8')).digest('hex');
}
