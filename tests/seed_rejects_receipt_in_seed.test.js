"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const seeds_1 = require("../src/lib/seeds");
describe("seed install rejects receipt in seed core", () => {
    test("throws if seed entry includes receipt", async () => {
        const tmp = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), "halo-seeds-bad-"));
        const repoRoot = tmp;
        node_fs_1.default.mkdirSync(node_path_1.default.join(repoRoot, "data", "seeds"), { recursive: true });
        const badSeed = [
            {
                schema_version: "halo.senator.v1",
                subject_id: "S000148",
                full_name: "Padilla, Alex",
                last_name: "Padilla",
                first_name: "Alex",
                middle_name: null,
                state: "CA",
                party: "D",
                chamber: "senate",
                class: 3,
                term_start: "2021-01-20",
                term_end: "2027-01-03",
                salary: 174000,
                dc_office: { address: "112 Hart Senate Office Building", phone: "202-224-3553" },
                committees: ["Judiciary"],
                caucuses: [],
                identifiers: { bioguide_id: "S000148" },
                sources: [
                    { kind: "bioguide", url: "https://bioguide.congress.gov/S000148", retrieved_at: "2024-01-01T00:00:00Z" }
                ],
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
                provenance: {
                    source: { kind: "senate", name: "U.S. Senate", url: "https://www.senate.gov/" },
                    retrieved_at: "2026-02-24T00:00:00Z"
                },
                receipt: {
                    receipt_id: "not-allowed-here",
                    schema_version: "halo.receipt.v1",
                    issued_at: "2026-02-24T00:00:00Z",
                    issuer: "halo-cli@0.1.0",
                    subject_id: "S000148",
                    artifact_type: "senator",
                    artifact_hash: "deadbeef",
                    artifact_schema: "halo.senator.v1",
                    signatures: []
                }
            }
        ];
        const seedPath = node_path_1.default.join(repoRoot, "data", "seeds", "senators_seed.json");
        node_fs_1.default.writeFileSync(seedPath, JSON.stringify(badSeed, null, 2), "utf8");
        await expect((0, seeds_1.installSenatorSeeds)({ repoRoot, seedPath, issuer: "halo-cli@0.1.0" })).rejects.toThrow(/must not include receipt|seeds must not include receipt/i);
    });
});
