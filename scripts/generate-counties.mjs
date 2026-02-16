#!/usr/bin/env node
/**
 * Fetches US county FIPS data and writes packages/data/src/counties.json.
 * Run: node scripts/generate-counties.mjs (or pnpm run generate:counties)
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SOURCE =
  "https://raw.githubusercontent.com/kjhealy/fips-codes/master/state_and_county_fips_master.csv";

async function main() {
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Failed to download CSV: HTTP ${res.status}`);
  const csv = await res.text();
  const rows = parseCsv(csv);

  const outPath = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "packages",
    "data",
    "src",
    "counties.json"
  );
  writeFileSync(outPath, JSON.stringify(rows, null, 2), "utf8");
  console.log(`Wrote ${rows.length} counties to ${outPath}`);
}

function parseCsv(csv) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const [header, ...data] = lines;
  const cols = header.split(",").map((c) => c.trim());
  const idxFips = cols.indexOf("fips");
  const idxName = cols.indexOf("name");
  const idxState = cols.indexOf("state");
  if (idxFips === -1 || idxName === -1 || idxState === -1) {
    throw new Error(`Unexpected CSV header: ${cols.join(", ")}`);
  }

  const out = [];
  for (const line of data) {
    const parts = line.split(",").map((p) => p.trim());
    const fips = parts[idxFips];
    const name = parts[idxName];
    const state = parts[idxState];

    if (!fips || !state) continue;
    if (state === "NA") continue; // state-level row

    const fipsStr = String(fips).padStart(5, "0");
    if (fipsStr.endsWith("000")) continue; // state-level FIPS

    const countyFips = fipsStr.substring(2);
    const countyName = name || "";
    out.push({ state, countyFips, countyName });
  }
  return out;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
