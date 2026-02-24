"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const seeds_1 = require("../src/lib/seeds");
function listFiles(dir) {
    return node_fs_1.default.existsSync(dir)
        ? node_fs_1.default.readdirSync(dir).map((f) => node_path_1.default.join(dir, f)).sort()
        : [];
}
describe("senator seed installation determinism", () => {
    test("re-installing seeds produces identical bytes (append-only, deterministic)", async () => {
        const tmp = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), "halo-seeds-"));
        const repoRoot = tmp;
        node_fs_1.default.mkdirSync(node_path_1.default.join(repoRoot, "data", "seeds"), { recursive: true });
        const seedSrc = node_path_1.default.join(__dirname, "fixtures", "senators_seed_minimal.json");
        const seedDst = node_path_1.default.join(repoRoot, "data", "seeds", "senators_seed.json");
        node_fs_1.default.copyFileSync(seedSrc, seedDst);
        await (0, seeds_1.installSenatorSeeds)({
            repoRoot,
            seedPath: seedDst,
            issuer: "halo-cli@0.1.0",
        });
        const outDir = node_path_1.default.join(repoRoot, "data", "senators");
        const firstFiles = listFiles(outDir);
        const firstBytes = firstFiles.map((p) => node_fs_1.default.readFileSync(p, "utf8"));
        await (0, seeds_1.installSenatorSeeds)({
            repoRoot,
            seedPath: seedDst,
            issuer: "halo-cli@0.1.0",
        });
        const secondFiles = listFiles(outDir);
        const secondBytes = secondFiles.map((p) => node_fs_1.default.readFileSync(p, "utf8"));
        expect(secondFiles).toEqual(firstFiles);
        expect(secondBytes).toEqual(firstBytes);
    });
});
