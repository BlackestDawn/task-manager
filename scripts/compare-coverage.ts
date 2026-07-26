// Compares this run's coverage against the committed baseline
// (coverage-baseline.json, kept up to date by .github/workflows/coverage-baseline.yml
// on every push to main) and fails if any metric regressed by more than
// TOLERANCE_PCT percentage points. Run after `bun run test:coverage`.
import { existsSync, readFileSync, appendFileSync } from "fs";

const TOLERANCE_PCT = 0.5;
const METRICS = ["lines", "statements", "functions", "branches"] as const;
type Metric = (typeof METRICS)[number];

// The flat shape we store in coverage-baseline.json — just the `total`
// object's pct fields from vitest's coverage-summary.json.
type BaselineSummary = Record<Metric, { pct: number }>;

const CURRENT_PATH = "coverage/coverage-summary.json";
const BASELINE_PATH = "coverage-baseline.json";

if (!existsSync(CURRENT_PATH)) {
  console.error(`Missing ${CURRENT_PATH} — run "bun run test:coverage" first.`);
  process.exit(1);
}

const currentReport = JSON.parse(readFileSync(CURRENT_PATH, "utf-8")) as { total: BaselineSummary };
const current = currentReport.total;

if (!existsSync(BASELINE_PATH)) {
  console.log(`No ${BASELINE_PATH} found yet — nothing to compare against. Current coverage:`);
  for (const metric of METRICS) {
    console.log(`  ${metric}: ${current[metric].pct.toFixed(2)}%`);
  }
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf-8")) as BaselineSummary;

let regressed = false;
const rows: string[] = [];

for (const metric of METRICS) {
  const before = baseline[metric].pct;
  const after = current[metric].pct;
  const delta = after - before;
  const sign = delta >= 0 ? "+" : "";
  const isRegression = delta < -TOLERANCE_PCT;
  if (isRegression) regressed = true;

  rows.push(
    `| ${metric} | ${before.toFixed(2)}% | ${after.toFixed(2)}% | ${sign}${delta.toFixed(2)}pp${isRegression ? " ⚠️" : ""} |`
  );
}

const table = [
  "| metric | baseline (main) | this run | change |",
  "| --- | --- | --- | --- |",
  ...rows,
].join("\n");

console.log(table);

const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  appendFileSync(summaryFile, `\n## Coverage vs. main\n\n${table}\n`);
}

if (regressed) {
  console.error(`\nCoverage regressed by more than ${TOLERANCE_PCT}pp on at least one metric.`);
  process.exit(1);
}

console.log("\nNo coverage regression.");
