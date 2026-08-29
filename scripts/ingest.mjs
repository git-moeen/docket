#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const url = (process.env.INFONA_URL || process.env.INFONA_API_URL || "").trim();
if (!url) {
  console.error(
    "INFONA_URL is unset. This script talks to a live Infona API. It will not invent a graph.",
  );
  console.error("Start Infona, then: INFONA_URL=http://localhost:8000 npm run ingest");
  process.exit(1);
}

process.env.INFONA_API_URL = url.replace(/\/$/, "");
const kg = process.env.INFONA_KG || "docket";
const csv = resolve(import.meta.dirname, "../data/docket.csv");
const infona = resolve(import.meta.dirname, "../node_modules/.bin/infona");

function run(args) {
  const result = spawnSync(infona, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(["ingest", csv, "--kg", kg]);
run(["er", "rebuild", "--kg", kg]);
console.log(`Ingested ${csv} into Infona kg=${kg} at ${process.env.INFONA_API_URL}`);
