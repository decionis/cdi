#!/usr/bin/env node

/**
 * Emits a CycloneDX 1.6 SBOM of the production dependency tree.
 *
 * Written after two attempts to derive one with Syft produced, in order, 566
 * components (the entire workspace, dev tooling included) and then zero (pnpm
 * stores real packages under node_modules/.pnpm behind symlinks, and neither a
 * directory scan nor an archive scan resolved them). v0.1.0 shipped the empty
 * one.
 *
 * `pnpm licenses list --prod` already knows the answer, is pnpm-aware by
 * definition, and is the same source ThirdPartyLicenses.md is generated from —
 * so the SBOM and the published inventory cannot disagree.
 *
 * Usage: node scripts/GenerateSbom.mjs <output-file> [component-version]
 */

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [outputFile, componentVersion = "0.0.0"] = process.argv.slice(2);

if (!outputFile) {
  console.error("usage: node scripts/GenerateSbom.mjs <output-file> [version]");
  process.exit(1);
}

/** Splits an SPDX expression into its individual license identifiers. */
function licenseEntries(expression) {
  if (!expression || expression === "UNKNOWN") return [];
  const terms = expression
    .replace(/[()]/g, " ")
    .split(/\s+(?:OR|AND)\s+/i)
    .map((term) => term.trim())
    .filter(Boolean);
  // A single well-formed identifier is expressed as `license.id`; anything
  // compound stays an `expression`, which is what the CycloneDX spec expects.
  if (terms.length === 1) return [{ license: { id: terms[0] } }];
  return [{ expression }];
}

function purlFor(name, version) {
  // pkg:npm/@scope/name@version — the scope separator stays unencoded.
  const encoded = name.startsWith("@")
    ? `${encodeURIComponent(name.split("/")[0])}/${encodeURIComponent(name.split("/").slice(1).join("/"))}`
    : encodeURIComponent(name);
  return `pkg:npm/${encoded}@${encodeURIComponent(version)}`;
}

const raw = execFileSync("pnpm", ["licenses", "list", "--prod", "--json"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});

const inventory = JSON.parse(raw);
const components = [];

for (const [expression, packages] of Object.entries(inventory)) {
  for (const entry of packages) {
    for (const version of entry.versions) {
      components.push({
        type: "library",
        "bom-ref": purlFor(entry.name, version),
        name: entry.name,
        version,
        purl: purlFor(entry.name, version),
        ...(licenseEntries(expression).length
          ? { licenses: licenseEntries(expression) }
          : {}),
      });
    }
  }
}

components.sort((a, b) =>
  a.name === b.name
    ? a.version.localeCompare(b.version)
    : a.name.localeCompare(b.name),
);

if (components.length === 0) {
  console.error("Refusing to write an SBOM with no components.");
  process.exit(1);
}

const bom = {
  $schema: "http://cyclonedx.org/schema/bom-1.6.schema.json",
  bomFormat: "CycloneDX",
  specVersion: "1.6",
  version: 1,
  metadata: {
    component: {
      type: "application",
      "bom-ref": `pkg:npm/%40decionis/cdi@${componentVersion}`,
      name: "@decionis/cdi",
      version: componentVersion,
      description:
        "Governed customer expansion for regulated fintech operations",
      licenses: [{ license: { id: "Apache-2.0" } }],
    },
    tools: {
      components: [
        {
          type: "application",
          name: "GenerateSbom.mjs",
          // Deliberately identified as this repository's own script rather than
          // a vendor tool, so a reviewer knows what produced the document.
          author: "Decionis, Inc.",
        },
      ],
    },
  },
  components,
};

writeFileSync(outputFile, `${JSON.stringify(bom, null, 2)}\n`);
console.log(`${outputFile}: ${components.length} components`);
