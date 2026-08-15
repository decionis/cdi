#!/usr/bin/env node

/**
 * Fails if any production dependency carries a license outside the approved policy.
 *
 * This is a policy gate, not a drift check. The generated inventory in
 * ThirdPartyLicenses.md is platform-conditional — `@img/sharp-*` and `@next/swc-*`
 * resolve per-architecture — so a regenerate-and-diff check would fail permanently
 * on a Linux runner against a macOS-generated file. Asserting the license *set*
 * instead is platform-independent and is the property that actually matters to a
 * reviewer: no dependency may introduce a copyleft or source-available obligation
 * without an explicit, recorded decision.
 */

import { execFileSync } from "node:child_process";

/** Permissive licenses accepted without review. */
const ALLOWED = new Set([
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC0-1.0",
  "ISC",
  "MIT",
  "Python-2.0",
  "Unlicense",
]);

/**
 * Licenses permitted only for specific packages, each with a recorded
 * justification in ThirdPartyLicenses.md. A new package under one of these
 * licenses fails the build until it is reviewed and added here.
 */
const EXCEPTIONS = new Map([
  ["CC-BY-4.0", new Set(["caniuse-lite"])],
  [
    "LGPL-3.0-or-later",
    new Set([
      "@img/sharp-libvips-darwin-arm64",
      "@img/sharp-libvips-darwin-x64",
      "@img/sharp-libvips-linux-arm",
      "@img/sharp-libvips-linux-arm64",
      "@img/sharp-libvips-linux-s390x",
      "@img/sharp-libvips-linux-x64",
      "@img/sharp-libvips-linuxmusl-arm64",
      "@img/sharp-libvips-linuxmusl-x64",
    ]),
  ],
]);

function isTermAllowed(term, packageName) {
  return ALLOWED.has(term) || EXCEPTIONS.get(term)?.has(packageName) === true;
}

/**
 * Evaluates an SPDX expression against the policy.
 *
 * OR and AND are not interchangeable here. Under "MIT OR Apache-2.0" we may pick
 * either, so one acceptable term is enough. Under "MIT AND GPL-3.0" both licenses
 * apply and the GPL obligation attaches regardless of the MIT half, so every term
 * must be acceptable. Collapsing the two would let a copyleft dependency through
 * on the strength of whatever permissive license sits beside it.
 *
 * Exception operands ("GPL-2.0 WITH Classpath-exception-2.0") change the meaning
 * of the license they modify, so they are never decomposed — the whole expression
 * must be named in the policy explicitly.
 */
function isSatisfied(expression, packageName) {
  const normalized = expression.replace(/[()]/g, " ").trim();

  if (/\sWITH\s/i.test(normalized)) {
    return isTermAllowed(normalized.replace(/\s+/g, " "), packageName);
  }

  // AND binds the whole expression: every conjunct must independently pass.
  return normalized.split(/\s+AND\s+/i).every((conjunct) =>
    conjunct
      .split(/\s+OR\s+/i)
      .map((term) => term.trim())
      .filter(Boolean)
      .some((term) => isTermAllowed(term, packageName)),
  );
}

function readProductionLicenses() {
  const raw = execFileSync("pnpm", ["licenses", "list", "--prod", "--json"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

const inventory = readProductionLicenses();
const violations = [];
let packageCount = 0;

for (const [expression, packages] of Object.entries(inventory)) {
  for (const entry of packages) {
    packageCount += 1;
    if (!isSatisfied(expression, entry.name)) {
      violations.push({
        name: entry.name,
        versions: entry.versions.join(", "),
        license: expression,
      });
    }
  }
}

if (violations.length > 0) {
  console.error(
    `License policy violation — ${violations.length} of ${packageCount} production packages are outside the approved set:\n`,
  );
  for (const violation of violations) {
    console.error(
      `  ${violation.name}@${violation.versions} — ${violation.license}`,
    );
  }
  console.error(
    "\nResolve by removing the dependency, or by recording an explicit exception in" +
      "\nscripts/CheckLicensePolicy.mjs and documenting the rationale in ThirdPartyLicenses.md.",
  );
  process.exit(1);
}

console.log(
  `License policy OK — ${packageCount} production packages, all within the approved set.`,
);
