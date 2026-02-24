import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { installSenatorSeeds } from "../src/lib/seeds";

function listFiles(dir: string): string[] {
  return fs.existsSync(dir)
    ? fs.readdirSync(dir).map((f) => path.join(dir, f)).sort()
    : [];
}

describe("senator seed installation determinism", () => {
  test("re-installing seeds produces identical bytes (append-only, deterministic)", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "halo-seeds-"));
    const repoRoot = tmp;
    fs.mkdirSync(path.join(repoRoot, "data", "seeds"), { recursive: true });
    const seedSrc = path.join(__dirname, "fixtures", "senators_seed_minimal.json");
    const seedDst = path.join(repoRoot, "data", "seeds", "senators_seed.json");
    fs.copyFileSync(seedSrc, seedDst);
    await installSenatorSeeds({
      repoRoot,
      seedPath: seedDst,
      issuer: "halo-cli@0.1.0",
    });
    const outDir = path.join(repoRoot, "data", "senators");
    const firstFiles = listFiles(outDir);
    const firstBytes = firstFiles.map((p) => fs.readFileSync(p, "utf8"));
    await installSenatorSeeds({
      repoRoot,
      seedPath: seedDst,
      issuer: "halo-cli@0.1.0",
    });
    const secondFiles = listFiles(outDir);
    const secondBytes = secondFiles.map((p) => fs.readFileSync(p, "utf8"));
    expect(secondFiles).toEqual(firstFiles);
    expect(secondBytes).toEqual(firstBytes);
  });
});
