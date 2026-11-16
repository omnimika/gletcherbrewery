import fs from "node:fs";
import path from "node:path";
import {
  assertManifestShape,
  loadTableFileJson,
} from "./manifest";
import type { LoyaltyImportManifest, LoyaltyTableFile } from "./types";

export function loadLoyaltyFixtureDir(dir: string): {
  manifest: LoyaltyImportManifest;
  files: LoyaltyTableFile[];
} {
  const manifestPath = path.join(dir, "manifest.json");
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as unknown;
  assertManifestShape(raw);
  const manifest = raw as LoyaltyImportManifest;

  const files: LoyaltyTableFile[] = manifest.files.map((f) => {
    const abs = path.join(dir, f.fileName);
    const body = JSON.parse(fs.readFileSync(abs, "utf8")) as unknown;
    return loadTableFileJson(body, f.tableId, f.fileName);
  });

  return { manifest, files };
}
