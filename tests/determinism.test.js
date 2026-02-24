"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Drift-guard: canonicalization determinism
const canonical_1 = require("../src/lib/canonical");
const hash_1 = require("../src/lib/hash");
const sample = { b: 2, a: 1 };
const expectedCanonical = '{"a":1,"b":2}';
const expectedHash = (0, hash_1.sha256Canonical)(sample);
if ((0, canonical_1.canonicalize)(sample) !== expectedCanonical) {
    throw new Error('Canonicalization drift detected');
}
if ((0, hash_1.sha256Canonical)(sample) !== expectedHash) {
    throw new Error('Hash drift detected');
}
console.log('Determinism test passed');
