import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import ingestVotes from "../src/cli/commands/ingest_votes";

function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFilesRecursive(p));
    else out.push(p);
  }
  return out.sort();
}

describe("ingest_votes determinism", () => {
  test("re-ingesting the same file produces identical artifact hashes and identical bytes", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "senate-ledger-"));
    const repoRoot = tmp;
    fs.mkdirSync(path.join(repoRoot, "data"), { recursive: true });
    fs.mkdirSync(path.join(repoRoot, "data", "seeds"), { recursive: true });
    const inputPath = path.join(repoRoot, "data", "seeds", "votes_minimal.json");
    const fixture = [
      {
        subject_id: "S000148",
        congress: 118,
        session: 2,
        roll_call: 12,
        occurred_at: "2024-01-23T19:12:00Z",
        retrieved_at: "2024-01-24T00:00:00Z",
        source_url: "https://www.congress.gov/roll-call-vote/118th-congress/senate-vote/12",
        question: "On Passage of the Bill",
        description: "Example deterministic fixture row",
        result: "Passed",
        vote_position: "Yea",
        bill_id: null,
        nomination_id: null,
        content_hash: "abc123",
        excerpt: "Sample excerpt"
      }
    ];
    fs.writeFileSync(inputPath, JSON.stringify(fixture, null, 2));
    await ingestVotes({ repoRoot, inputPath, publisher: "congress.gov" });
    const firstFiles = listFilesRecursive(path.join(repoRoot, "data", "events"));
    const firstBytes = firstFiles.map((p) => fs.readFileSync(p, "utf8"));
    await ingestVotes({ repoRoot, inputPath, publisher: "congress.gov" });
    const secondFiles = listFilesRecursive(path.join(repoRoot, "data", "events"));
    const secondBytes = secondFiles.map((p) => fs.readFileSync(p, "utf8"));
    expect(secondFiles).toEqual(firstFiles);
    expect(secondBytes).toEqual(firstBytes);
  });
});
