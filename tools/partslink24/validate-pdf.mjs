#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

const pdfPath = args.find((arg, index) => !arg.startsWith("--") && !["--brand", "--vin"].includes(args[index - 1]));
const brand = readOption(args, "--brand");
const vin = readOption(args, "--vin");

if (!pdfPath) fail("Missing PDF path.");
if (!brand) fail("Missing --brand.");
if (!vin) fail("Missing --vin.");

const routes = JSON.parse(readFileSync(join(__dirname, "brand-routes.json"), "utf8"));
const brandConfig = routes.brands[brand];
if (!brandConfig) fail(`Unknown brand: ${brand}`);

const absolutePdfPath = resolve(pdfPath);
if (!existsSync(absolutePdfPath)) fail(`PDF file does not exist: ${absolutePdfPath}`);

const metadata = readPdfInfo(absolutePdfPath);
const text = readPdfText(absolutePdfPath);

const checks = [
  ["subject_matches_vin", metadata.Subject === vin],
  ["text_contains_vin", text.includes(vin)],
  ...brandConfig.expectedKeywords.map((keyword) => [
    `keyword_contains_${slugify(keyword)}`,
    (metadata.Keywords || "").includes(keyword)
  ]),
  [
    "expected_brand_text_present",
    brandConfig.expectedTextAny.some((needle) => text.includes(needle))
  ]
];

const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
const result = {
  ok: failed.length === 0,
  pdf: absolutePdfPath,
  brand,
  vin,
  pages: Number(metadata.Pages || 0),
  title: metadata.Title || null,
  subject: metadata.Subject || null,
  keywords: metadata.Keywords || null,
  failed
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(result.ok ? 0 : 1);

function readPdfInfo(path) {
  const pdfinfo = findBinary("pdfinfo");
  const output = execFileSync(pdfinfo, [path], { encoding: "utf8" });
  const metadata = {};
  for (const line of output.split("\n")) {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) metadata[match[1].trim()] = match[2].trim();
  }
  return metadata;
}

function readPdfText(path) {
  try {
    const pdftotext = findBinary("pdftotext", { required: false });
    if (pdftotext) {
      return execFileSync(pdftotext, [path, "-"], { encoding: "utf8" });
    }
  } catch {
    // Fall back to Python below.
  }

  const python = findPython();
  return execFileSync(
    python,
    [
      "-c",
      "from pypdf import PdfReader; import sys; r=PdfReader(sys.argv[1]); print('\\n'.join((p.extract_text() or '') for p in r.pages))",
      path
    ],
    { encoding: "utf8" }
  );
}

function findBinary(name, options = {}) {
  const required = options.required !== false;
  const candidates = [
    name,
    join(repoRoot, "node_modules/.bin", name),
    join(process.env.HOME || "", ".cache/codex-runtimes/codex-primary-runtime/dependencies/bin", name)
  ];
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ["-v"], { stdio: "ignore" });
      return candidate;
    } catch {
      try {
        execFileSync(candidate, ["-h"], { stdio: "ignore" });
        return candidate;
      } catch {
        // Try next candidate.
      }
    }
  }
  if (required) fail(`Missing binary: ${name}`);
  return null;
}

function findPython() {
  const candidates = [
    process.env.PYTHON,
    "python3",
    join(process.env.HOME || "", ".cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ["-c", "import pypdf"], { stdio: "ignore" });
      return candidate;
    } catch {
      // Try next candidate.
    }
  }
  fail("Missing Python with pypdf.");
}

function readOption(values, name) {
  const index = values.indexOf(name);
  return index >= 0 ? values[index + 1] : undefined;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`Usage:
  node tools/partslink24/validate-pdf.mjs <pdf-path> --brand <brand> --vin <vin>

Example:
  node tools/partslink24/validate-pdf.mjs ~/Downloads/WBA31AA0905V40977.pdf --brand BMW --vin WBA31AA0905V40977
`);
}
