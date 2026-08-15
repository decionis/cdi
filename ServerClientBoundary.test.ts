/**
 * @vitest-environment node
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the server/client boundary against credential leakage.
 *
 * Props passed from a Server Component into a Client Component are serialized
 * into the RSC payload delivered to the browser. `StewardSession` carries
 * `accessToken`, so the moment a component holding a session is marked
 * "use client" — or a session is passed to one that is — the Decionis access
 * token ships to the browser in the page payload.
 *
 * Nothing in the type system prevents that, and it would not fail any other
 * test, so the invariant is asserted structurally here.
 */

const SOURCE_ROOTS = ["app", "components"];
const SOURCE_EXTENSIONS = [".ts", ".tsx"];
const repoRoot = new URL("./", import.meta.url).pathname;

function sourceFiles(directory: string): string[] {
  const entries = readdirSync(join(repoRoot, directory), {
    withFileTypes: true,
  });

  return entries.flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) return [];
    if (entry.name.includes(".test.")) return [];
    return [path];
  });
}

interface SourceFile {
  path: string;
  contents: string;
}

const allSources: SourceFile[] = SOURCE_ROOTS.flatMap((root) =>
  sourceFiles(root).map((path) => ({
    path: relative(".", path),
    contents: readFileSync(join(repoRoot, path), "utf8"),
  })),
);

const clientSources = allSources.filter((file) =>
  /^\s*["']use client["']/m.test(file.contents),
);

describe("server/client boundary", () => {
  it("finds the source tree it is meant to be guarding", () => {
    // A refactor that moves or renames these directories must not silently
    // reduce this suite to asserting nothing.
    expect(allSources.length).toBeGreaterThan(10);
    expect(clientSources.length).toBeGreaterThan(0);
  });

  it("keeps StewardSession out of every client component", () => {
    const offenders = clientSources
      .filter((file) => file.contents.includes("StewardSession"))
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  it("never references an access token in client code", () => {
    const offenders = clientSources
      .filter((file) =>
        /accessToken|serviceToken|bearerToken/.test(file.contents),
      )
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  it("keeps the components that receive a session on the server", () => {
    // AppShell takes the whole StewardSession. If it ever becomes a client
    // component, the token is serialized into the page payload.
    const sessionHolders = allSources
      .filter((file) => /\bsession:\s*StewardSession\b/.test(file.contents))
      .map((file) => file.path);

    expect(sessionHolders.length).toBeGreaterThan(0);

    for (const holder of sessionHolders) {
      const file = allSources.find((candidate) => candidate.path === holder);
      expect(file && /^\s*["']use client["']/m.test(file.contents)).toBe(false);
    }
  });
});
