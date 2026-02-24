tests/
# Senate Accountability Tool

An append-only, evidence-first public ledger for all 100 United States Senators.

This system records structured, schema-validated artifacts using deterministic canonical JSON and cryptographic hashing. Its purpose is to preserve verifiable public records with symmetry, reproducibility, and audit integrity.

---

## Core Properties

### Symmetry

All senators are represented using identical schemas and metrics.
No party-based branching or selective treatment.

### Append-Only

Artifacts are never modified in place.
Corrections and updates are recorded as new artifacts.

### Deterministic Serialization

All artifacts are canonicalized (sorted keys) prior to hashing.

Identical input produces identical bytes and identical hashes.

### Evidence-First

Each event references a primary source.
The system records structured facts only.
No scoring, interpretation, or editorial language.

### Cryptographic Sealing

Every stored artifact embeds a receipt containing:

* `artifact_hash` (sha256 of canonical core, excluding receipt)
* `schema_version`
* `issuer`
* `issued_at` (anchored to input timestamps)

The receipt itself is excluded from the artifact hash.

### Offline-First

Core operation requires no live API dependencies.

---

## Artifact Types

### Senator (`halo.senator.v1`)

Identity artifact representing a single senator.

### Event (`halo.event.v1`)

Structured record of a discrete action (e.g., vote, sponsorship, filing).

### Index (`halo.index.v1`)

Deterministic derived artifact built from stored events.
Index artifacts are receipt-sealed and verifiable.

---

## Hashing Model

```
artifact_hash = sha256(canonical_json(core_without_receipt))
```

* Receipt does not participate in hashing.
* Event and index filenames equal their `artifact_hash`.

---

## Verification

The `verify` command enforces:


---

## Quickstart (Offline)

Requirements:
- Node.js 20+

Install dependencies:
```
* A social network
```

Build the CLI:
```

```

Show CLI help:
```
It is a structured public memory system.
```

## CLI Usage

Initialize senator seeds:
```

```

Ingest votes from a local fixture:
```
---
```

Verify all artifacts:
```

```

## Data Layout

- data/senators/<subject_id>.json
- data/events/<subject_id>/<artifact_hash>.json

## Determinism Contract

- No runtime timestamps in artifacts
- artifact_hash excludes receipt
- Filenames derived from artifact_hash
- Append-only: collision if bytes differ

---

## Non-Goals

This system is not:

- A news publication
- A political commentary engine
- A corruption allegation platform
- A scoring or ranking system
- A social network

It is a structured public memory system.

---

## Governance Model

The tool records verifiable facts tied to primary sources.
Interpretation and analysis occur outside the system.
## Governance Model

The tool records verifiable facts tied to primary sources.
Interpretation and analysis occur outside the system.