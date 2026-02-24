// Drift-guard: canonicalization determinism
import { canonicalize } from '../src/lib/canonical';
import { sha256Canonical } from '../src/lib/hash';

const sample = { b: 2, a: 1 };
const expectedCanonical = '{"a":1,"b":2}';
const expectedHash = sha256Canonical(sample);

if (canonicalize(sample) !== expectedCanonical) {
  throw new Error('Canonicalization drift detected');
}
if (sha256Canonical(sample) !== expectedHash) {
  throw new Error('Hash drift detected');
}
console.log('Determinism test passed');
