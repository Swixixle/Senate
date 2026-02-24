"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const ingest_votes_1 = __importDefault(require("../src/cli/commands/ingest_votes"));
function listFilesRecursive(dir) {
    const out = [];
    for (const ent of node_fs_1.default.readdirSync(dir, { withFileTypes: true })) {
        const p = node_path_1.default.join(dir, ent.name);
        if (ent.isDirectory())
            out.push(...listFilesRecursive(p));
        else
            out.push(p);
    }
    return out.sort();
}
describe("ingest_votes determinism", () => {
    test("re-ingesting the same file produces identical artifact hashes and identical bytes", async () => {
        const tmp = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), "senate-ledger-"));
        const repoRoot = tmp;
        node_fs_1.default.mkdirSync(node_path_1.default.join(repoRoot, "data"), { recursive: true });
        node_fs_1.default.mkdirSync(node_path_1.default.join(repoRoot, "data", "seeds"), { recursive: true });
        const inputPath = node_path_1.default.join(repoRoot, "data", "seeds", "votes_minimal.json");
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
        node_fs_1.default.writeFileSync(inputPath, JSON.stringify(fixture, null, 2));
        await (0, ingest_votes_1.default)({ repoRoot, inputPath, publisher: "congress.gov" });
        const firstFiles = listFilesRecursive(node_path_1.default.join(repoRoot, "data", "events"));
        const firstBytes = firstFiles.map((p) => node_fs_1.default.readFileSync(p, "utf8"));
        await (0, ingest_votes_1.default)({ repoRoot, inputPath, publisher: "congress.gov" });
        const secondFiles = listFilesRecursive(node_path_1.default.join(repoRoot, "data", "events"));
        const secondBytes = secondFiles.map((p) => node_fs_1.default.readFileSync(p, "utf8"));
        expect(secondFiles).toEqual(firstFiles);
        expect(secondBytes).toEqual(firstBytes);
    });
});
