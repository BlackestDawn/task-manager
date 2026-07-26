// Writes coverage-baseline.json from this run's coverage/coverage-summary.json
// — just the four `total` pct fields, nothing per-file. Run after
// `bun run test:coverage`. Used to seed the baseline and by
// .github/workflows/coverage-baseline.yml to refresh it on every main push.
import { readFileSync, writeFileSync } from "fs";

const METRICS = ["lines", "statements", "functions", "branches"] as const;

const report = JSON.parse(readFileSync("coverage/coverage-summary.json", "utf-8")) as {
  total: Record<(typeof METRICS)[number], { pct: number }>;
};

const baseline = Object.fromEntries(
  METRICS.map((metric) => [metric, { pct: report.total[metric].pct }])
);

writeFileSync("coverage-baseline.json", JSON.stringify(baseline, null, 2) + "\n");
console.log("Wrote coverage-baseline.json:", baseline);
