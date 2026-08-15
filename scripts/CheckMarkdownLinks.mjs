#!/usr/bin/env node

/**
 * Verifies that every relative link in the given Markdown files resolves to a
 * file that exists.
 *
 * Written after OpenSource.md accumulated fifteen links written as `../` while
 * the file sits at the repository root — every one of them pointing outside the
 * repository and 404-ing on GitHub, including the links to SECURITY.md and
 * EvidencePack.md in the document most likely to be handed to a reviewer.
 *
 * The first check written for that bug reported all fifteen as fine, because it
 * stripped `./` and `../` identically before testing existence. This resolves
 * each link against the directory of the file that contains it, which is what
 * a reader's browser does.
 *
 * Usage:
 *   node scripts/CheckMarkdownLinks.mjs                 # every tracked .md file
 *   node scripts/CheckMarkdownLinks.mjs README.md ...   # only these
 */

import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";

/**
 * Matches the target of a Markdown link or image. The target is everything up
 * to a closing paren, a whitespace-delimited title, or a fragment.
 */
const LINK = /!?\[[^\]]*\]\(([^)\s]+)/g;

function isExternal(target) {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(target) || // http:, https:, mailto:, tel:
    target.startsWith("//") ||
    target.startsWith("#") // same-document anchor
  );
}

function markdownFiles() {
  const tracked = execFileSync("git", ["ls-files", "*.md", "**/*.md"], {
    encoding: "utf8",
  });
  return tracked.split("\n").filter(Boolean);
}

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : markdownFiles();

const broken = [];

for (const file of files) {
  if (!file.endsWith(".md") || !existsSync(file)) continue;

  const base = dirname(resolve(file));
  const contents = readFileSync(file, "utf8");

  for (const match of contents.matchAll(LINK)) {
    const target = match[1];
    if (isExternal(target)) continue;

    // Strip a fragment so `./ThreatModel.md#threats` checks the file.
    const [path] = target.split("#");
    if (!path) continue;

    const resolved = resolve(base, decodeURIComponent(path));
    if (!existsSync(resolved)) {
      broken.push({ file, target, resolved });
    }
  }
}

if (broken.length > 0) {
  process.stderr.write(
    `\n${broken.length} broken relative link${broken.length === 1 ? "" : "s"}:\n\n`,
  );
  for (const { file, target, resolved } of broken) {
    process.stderr.write(`  ${file}\n    ${target}  ->  ${resolved}\n`);
  }
  process.stderr.write(
    "\nA link is resolved against the directory of the file containing it.\n" +
      "A document at the repository root links to a sibling with ./name, not ../name.\n\n",
  );
  process.exit(1);
}

console.log(
  `Markdown links OK — ${files.length} file${files.length === 1 ? "" : "s"} checked, no broken relative links.`,
);
