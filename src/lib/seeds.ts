import fs from "node:fs";
import path from "node:path";

import { canonicalize } from "./canonical";
import { sha256Canonical } from "./hash";
import { validateOrThrow } from "./validate";
import { ensureDir, writeFileAtomic } from "./storage";

const RECEIPT_ARTIFACT_TYPE_ENUM = ["senator", "event"] as const;
const RECEIPT_ARTIFACT_SCHEMA_ENUM = ["halo.senator.v1", "halo.event.v1"] as const;

function requireEnum<T extends readonly string[]>(
  label: string,
  value: string,
  allowed: T
): asserts value is T[number] {
  if (!allowed.includes(value)) {
    throw new Error(`${label} must be one of: ${allowed.join(", ")} (got: ${value})`);
  }
}

function requireRfc3339Z(label: string, v: unknown): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`seed install: missing ${label}`);
  }
  const ok = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(v.trim());
  if (!ok) throw new Error(`seed install: ${label} must be RFC3339 Zulu: ${v}`);
  return v.trim();
}

export async function installSenatorSeeds(opts: {
  repoRoot: string;
  seedPath: string;
  issuer: string;
}) {
  const { repoRoot, seedPath, issuer } = opts;

  const raw = fs.readFileSync(seedPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`seed install: expected JSON array at ${seedPath}`);
  }

  // Deterministic iteration order
  const seeds = [...parsed].sort((a, b) =>
    String(a?.subject_id ?? "").localeCompare(String(b?.subject_id ?? ""))
  );

  const outDir = path.join(repoRoot, "data", "senators");
  await ensureDir(outDir);

  for (const seed of seeds) {
    const subject_id = String(seed?.subject_id ?? "").trim();
    if (!/^S\d{6}$/.test(subject_id)) {
      throw new Error(`seed install: invalid subject_id: ${subject_id}`);
    }
    if (seed.receipt != null) {
      throw new Error(`seed install: seeds must not include receipt (found on ${subject_id})`);
    }
    validateOrThrow("senator_seed", seed);
    const issued_at = requireRfc3339Z(
      "sources[0].retrieved_at",
      seed?.sources?.[0]?.retrieved_at
    );
    const coreCanonical = canonicalize(seed);
    const artifact_hash = sha256Canonical(seed);
    const receipt = makeSenatorReceipt({
      subject_id,
      artifact_hash,
      issued_at,
      issuer,
    });
    requireEnum("receipt.artifact_type", receipt.artifact_type, RECEIPT_ARTIFACT_TYPE_ENUM);
    requireEnum("receipt.artifact_schema", receipt.artifact_schema, RECEIPT_ARTIFACT_SCHEMA_ENUM);
    const artifact = { ...seed, receipt };
    validateOrThrow("senator", artifact);
    const outPath = path.join(outDir, `${subject_id}.json`);
    const bytes = canonicalize(artifact);
    if (fs.existsSync(outPath)) {
      const existing = fs.readFileSync(outPath, "utf8");
      if (existing !== bytes) {
        throw new Error(`seed install: collision (non-identical) at ${outPath}`);
      }
      continue;
    }
    await writeFileAtomic(outPath, bytes);
  }
}

function makeSenatorReceipt(opts: {
  subject_id: string;
  artifact_hash: string;
  issued_at: string;
  issuer: string;
}) {
  const receipt_id = sha256Canonical(
    `${opts.subject_id}|senator|${opts.artifact_hash}|${opts.issued_at}|${opts.issuer}`
  );
  const receipt = {
    receipt_id,
    schema_version: "halo.receipt.v1",
    issued_at: opts.issued_at,
    issuer: opts.issuer,
    subject_id: opts.subject_id,
    artifact_type: "senator",
    artifact_hash: opts.artifact_hash,
    artifact_schema: "halo.senator.v1",
    signatures: [],
  };
  return receipt;
}
