#!/usr/bin/env node
/**
 * Optional smoke test: run while the app is up (pnpm dev).
 * Usage: pnpm run smoke:live
 * Expects http://localhost:3000 to be serving the app.
 */
const base = process.env.SMOKE_BASE ?? "http://localhost:3000";
const address = "308 Chippendale Ave, Austin, TX 78745";
const url = `${base}/api/link?address=${encodeURIComponent(address)}`;

const res = await fetch(url);
if (!res.ok) {
  console.error("Smoke failed: HTTP", res.status);
  process.exit(1);
}

const data = await res.json();
if (!data.url || !data.url.includes("travis.prodigycad.com")) {
  console.error("Smoke failed: expected Travis URL, got", data);
  process.exit(1);
}

console.log("Smoke OK: Travis County link returned for Austin address.");
