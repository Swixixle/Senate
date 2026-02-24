const EVENT_TYPE_ENUM = [
  "vote",
  "bill_sponsorship",
  "donation",
  "statement",
  "press_release",
  "media_appearance",
  "filing",
  "correction",
  "retraction",
  "note",
] as const;

const SOURCE_KIND_ENUM = [
  "congress",
  "senate",
  "fec",
  "court",
  "publisher",
  "press_release",
  "other",
] as const;

const POSITION_ENUM = ["Yea", "Nay", "Present", "Not Voting"] as const;

const EVIDENCE_CONTENT_TYPE_ENUM = ["text", "html", "pdf", "json"] as const;

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
import fs from "node:fs";
import path from "node:path";
import { canonicalize } from "../../lib/canonical";
import { sha256Canonical } from "../../lib/hash";
import { validateOrThrow } from "../../lib/validate";
import { writeJson } from "../../lib/storage";
import { createReceipt } from "../../lib/receipts";

/**
 * Deterministic offline vote ingestion.
 * Input: JSON array of vote records.
 * Output: append-only event artifacts written to:
 *   data/events/<subject_id>/<artifact_hash>.json
 */
export default async function ingestVotes(opts: { inputPath: string; repoRoot?: string; publisher?: string }) {
  if (!opts?.inputPath) {
    throw new Error("Usage: ingest_votes <inputPath>\nYou must provide a path to the vote ingestion JSON input file.");
  }
  const resolvedPath = path.resolve(process.cwd(), opts.inputPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Input file not found: ${resolvedPath}`);
  }
  const publisher = opts?.publisher || "congress.gov";
  const raw = fs.readFileSync(resolvedPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`ingest_votes: input must be a JSON array: ${resolvedPath}`);
  }
  const repoRoot = opts?.repoRoot || process.cwd();
  const outBase = path.join(repoRoot, "data", "events");

  for (const row of parsed) {
    const norm = normalizeVoteInput(row);

    // Deterministic event core (no receipt yet)
    const eventCore = {
      event_id: deriveEventId(norm),
      schema_version: "halo.event.v1",
      subject_id: norm.subject_id,
      event_type: "vote",
      occurred_at: norm.occurred_at,
      captured_at: norm.retrieved_at, // anchor to input
      source: {
        kind: "congress",
        name: publisher,
        url: norm.source_url,
        retrieved_at: norm.retrieved_at,
      },
      evidence: {
        primary_url: norm.source_url,
        content_hash: norm.content_hash,
        content_type: "text",
        excerpt: norm.excerpt || undefined,
      },
      payload: {
        congress: norm.congress,
        session: norm.session,
        roll_call: norm.roll_call,
        bill_id: norm.bill_id,
        nomination_id: norm.nomination_id,
        question: norm.question,
        description: norm.description,
        position: norm.vote_position,
        result: norm.result,
        vote_url: norm.source_url,
      },
    };

    // Validate event core before hashing
    validateOrThrow("halo.event.v1", eventCore);

    // Canonicalize and hash WITHOUT receipt
    const canonical = canonicalize(eventCore);
    const artifact_hash = sha256Canonical(eventCore);

    // Deterministic receipt (no runtime timestamps)
    const receipt = {
      receipt_id: `rcpt_${eventCore.subject_id}_${artifact_hash}`,
      schema_version: "halo.receipt.v1",
      issued_at: eventCore.captured_at,
      issuer: { system: "senate-accountability-tool", version: "0.1.0" },
      subject_id: eventCore.subject_id,
      artifact_type: "event",
      artifact_hash,
      artifact_schema: "halo.event.v1",
      evidence_hash: eventCore.evidence.content_hash,
      signatures: [],
    };

    // Final artifact with embedded receipt
    const artifact = { ...eventCore, receipt };

    // Validate final artifact
    validateOrThrow("halo.event.v1", artifact);

    // Append-only write: filename = artifact_hash
    const dir = path.join(outBase, norm.subject_id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const outPath = path.join(dir, `${artifact_hash}.json`);

    // Never overwrite; if exists, content must match exactly
    if (fs.existsSync(outPath)) {
      const existing = fs.readFileSync(outPath, "utf8");
      const next = canonicalize(artifact);
      if (existing !== next) {
        throw new Error(`ingest_votes: artifact collision with non-identical content: ${outPath}`);
      }
      continue;
    }

    // Write canonical JSON bytes
    writeJson(outPath, artifact);
  }
}

type VotePosition = (typeof POSITION_ENUM)[number];

function normalizeVotePosition(v: unknown): VotePosition {
  const raw = String(v ?? "").trim();
  const s = raw.toLowerCase();

  if (s === "yea" || s === "yes") return "Yea";
  if (s === "nay" || s === "no") return "Nay";
  if (s === "present") return "Present";
  if (s === "not voting" || s === "not_voting" || s === "absent") return "Not Voting";

  // Accept exact enum values (case-sensitive)
  requireEnum("payload.position", raw, POSITION_ENUM);
  return raw as VotePosition;
}

function requireIso8601(label: string, v: unknown): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`ingest_votes: missing ${label}`);
  }
  const ok = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(v.trim());
  if (!ok) throw new Error(`ingest_votes: ${label} must be ISO8601 Zulu: ${v}`);
  return v.trim();
}

function normalizeVoteInput(row: any): {
  subject_id: string;
  congress: number;
  session: number;
  roll_call: number;
  occurred_at: string;
  retrieved_at: string;
  source_url: string;
  question: string;
  description?: string | null;
  result: string;
  vote_position: VotePosition;
  bill_id: string | null;
  nomination_id: string | null;
  content_hash: string;
  excerpt?: string;
} {
  if (row == null || typeof row !== "object") {
    throw new Error("ingest_votes: each row must be an object");
  }
  const subject_id = String(row.subject_id ?? "").trim();
  if (!/^S\d{6}$/.test(subject_id)) {
    throw new Error(`ingest_votes: invalid subject_id (expected bioguide like S000148): ${subject_id}`);
  }
  const congress = Number(row.congress);
  const session = Number(row.session ?? 1);
  const roll_call = Number(row.roll_call);
  if (!Number.isInteger(congress) || congress <= 0) throw new Error(`ingest_votes: invalid congress: ${row.congress}`);
  if (!Number.isInteger(session) || session <= 0) throw new Error(`ingest_votes: invalid session: ${row.session}`);
  if (!Number.isInteger(roll_call) || roll_call <= 0) throw new Error(`ingest_votes: invalid roll_call: ${row.roll_call}`);
  const occurred_at = requireIso8601("occurred_at", row.occurred_at);
  const retrieved_at = requireIso8601("retrieved_at", row.retrieved_at);
  const source_url = String(row.source_url ?? "").trim();
  if (!/^https?:\/\//.test(source_url)) {
    throw new Error(`ingest_votes: invalid source_url: ${source_url}`);
  }
  const question = String(row.question ?? "").trim();
  if (!question) throw new Error("ingest_votes: missing question");
  const result = String(row.result ?? "").trim();
  if (!result) throw new Error("ingest_votes: missing result");
  const description = row.description == null ? null : String(row.description).trim();
  const vote_position = normalizeVotePosition(row.vote_position);
  requireEnum("event_type", "vote", EVENT_TYPE_ENUM);
  requireEnum("source.kind", "congress", SOURCE_KIND_ENUM);
  requireEnum("evidence.content_type", "text", EVIDENCE_CONTENT_TYPE_ENUM);
  const bill_id = row.bill_id == null ? null : String(row.bill_id).trim();
  const nomination_id = row.nomination_id == null ? null : String(row.nomination_id).trim();
  const content_hash = row.content_hash == null ? "" : String(row.content_hash).trim();
  const excerpt = row.excerpt == null ? undefined : String(row.excerpt).trim();
  return {
    subject_id,
    congress,
    session,
    roll_call,
    occurred_at,
    retrieved_at,
    source_url,
    question,
    description,
    result,
    vote_position,
    bill_id,
    nomination_id,
    content_hash,
    excerpt,
  };
}

function deriveEventId(n: {
  subject_id: string;
  congress: number;
  session: number;
  roll_call: number;
  vote_position: VotePosition;
}): string {
  // Deterministic ID (not filename)
  const s = `${n.subject_id}|${n.congress}|${n.session}|${n.roll_call}|${n.vote_position}`;
  return sha256Canonical(s);
}
