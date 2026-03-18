# Senate Accountability Tool

An append-only, evidence-first public ledger for all 100 United States Senators.

This system records structured, schema-validated artifacts using deterministic canonical JSON and cryptographic hashing. Its purpose is to preserve verifiable public records with symmetry, reproducibility, and audit integrity.

---

## What is Senate?

Senate is a command-line tool that maintains a cryptographically-sealed, append-only public record of actions taken by each of the 100 United States Senators. It ingests structured data (votes, sponsorships, filings, and other public acts), canonicalizes it, hashes it with SHA256, and stores it alongside a verifiable receipt — making the entire ledger independently auditable.

Key design principles:

- **Symmetry** — All senators are represented using identical schemas and metrics. No party-based branching or selective treatment.
- **Append-Only** — Artifacts are never modified in place. Corrections and updates are recorded as new artifacts.
- **Deterministic Serialization** — All artifacts are canonicalized (sorted keys, no whitespace) prior to hashing. Identical input produces identical bytes and identical hashes.
- **Evidence-First** — Each event references a primary source. The system records structured facts only. No scoring, interpretation, or editorial language.
- **Cryptographic Sealing** — Every stored artifact embeds a receipt containing the SHA256 hash of its canonical core, a schema version, an issuer, and an anchored timestamp.
- **Offline-First** — Core operation requires no live API dependencies.

---

## Project Status

**v0.1.0 — Early Development**

The CLI and core data pipeline are functional. The following commands are available:

| Command | Status |
|---|---|
| `halo init` | ✅ Available |
| `halo ingest_votes <path>` | ✅ Available |
| `halo verify` | ✅ Available |

The schema definitions, hashing model, and storage layout are stable. Indexing (`halo.index.v1`) is defined in the schema but not yet fully implemented in the CLI.

---

## Quick Start

**Requirements:** Node.js 20+

```sh
# Install dependencies
npm ci

# Build the CLI
npm run build

# Show available commands
node dist/cli/index.js --help
```

**Initialize senator seeds** (creates `data/senators/<id>.json` for all 100 senators):
```sh
node dist/cli/index.js init
```

**Ingest votes from a local JSON file:**
```sh
node dist/cli/index.js ingest_votes path/to/votes.json
```

**Verify all stored artifacts:**
```sh
node dist/cli/index.js verify
```

**Run tests:**
```sh
npm test
```

---

## Artifact Types

### Senator (`halo.senator.v1`)

Identity artifact representing a single senator, including bio, committee assignments, and cross-system identifiers (FEC, Bioguide, GovTrack, etc.).

### Event (`halo.event.v1`)

Structured record of a discrete action (e.g., vote, sponsorship, filing). Each event references a primary source URL.

### Index (`halo.index.v1`)

Deterministic derived artifact built from stored events. Index artifacts are receipt-sealed and verifiable.

---

## Hashing Model

```
artifact_hash = sha256(canonical_json(core_without_receipt))
```

- Receipt does not participate in hashing.
- Event and index filenames equal their `artifact_hash`.

---

## Verification

The `verify` command checks that every stored artifact's `artifact_hash` matches a fresh hash of its canonical core. Any file that has been modified since it was written will fail verification.

---

## Data Layout

```
data/
  senators/<subject_id>.json          # Senator identity artifacts
  events/<subject_id>/<hash>.json     # Event artifacts, keyed by artifact_hash
```

## Determinism Contract

- No runtime timestamps in artifacts
- `artifact_hash` excludes the receipt
- Filenames are derived from `artifact_hash`
- Append-only: a hash collision with different bytes is an error

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