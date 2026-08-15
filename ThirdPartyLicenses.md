# Third-Party Licenses

Decionis CDI is licensed under [Apache-2.0](./LICENSE). It redistributes the third-party components
below, each under its own license.

**25 packages** in the production dependency tree, resolved from `pnpm-lock.yaml`.

Regenerate with:

```bash
pnpm licenses list --prod
```

This inventory covers **production dependencies only**. Development dependencies (ESLint, Prettier,
TypeScript, Vitest, and their transitive tree) are build-time tooling, are not redistributed in the
deployed artifact, and are excluded deliberately.

## Summary

| License           | Packages | Notes                                |
| ----------------- | -------- | ------------------------------------ |
| MIT               | 14       | Permissive                           |
| Apache-2.0        | 4        | Permissive, patent grant             |
| ISC               | 3        | Permissive                           |
| BSD-3-Clause      | 1        | Permissive                           |
| 0BSD              | 1        | Permissive, no attribution required  |
| CC-BY-4.0         | 1        | Data, not code — see below           |
| LGPL-3.0-or-later | 1        | Optional platform binary — see below |

No copyleft license applies to any Decionis CDI source file, and no dependency imposes a reciprocal
obligation on this codebase.

### Platform-conditional packages

The `@img/sharp-*` and `@next/swc-*` packages are architecture-specific binaries; the exact set
resolved depends on the build platform. The inventory below was generated on macOS arm64. A Linux
x64 deployment resolves the corresponding `linux-x64` variants under the same licenses. Regenerate
this file on the target platform for a deployment-accurate SBOM.

## Notes on non-permissive licenses

Both entries below are transitive dependencies of Next.js. Neither affects the licensing of Decionis
CDI itself, and both are stated here so that a reviewer does not have to derive the answer.

### LGPL-3.0-or-later — `@img/sharp-libvips-darwin-arm64`

Pulled in transitively by Next.js, which uses `sharp` for image optimization.

It is a separate, unmodified, dynamically-linked platform binary of the libvips library. This is the
arrangement contemplated by LGPL §4: it imposes no reciprocal source-disclosure obligation on
Decionis CDI, and the library is redistributed unmodified.

**Decionis CDI does not use `next/image` anywhere in its source.** The dependency is present only
because Next.js declares it, and it is not exercised at runtime by this application. Where an
organization's policy prohibits LGPL components outright, the dependency can be excluded at build
time without any loss of functionality.

### CC-BY-4.0 — `caniuse-lite`

Browser compatibility **data**, not executable code, consumed by Browserslist during the build to
determine CSS and JavaScript output targets. Attribution is satisfied by this listing. The dataset is
not redistributed as a standalone work.

## Dependency resolution overrides

`package.json` declares a `pnpm.overrides` block pinning three transitive packages above their
vulnerable ranges:

| Package   | Override  | Reason                                             |
| --------- | --------- | -------------------------------------------------- |
| `postcss` | `^8.5.26` | Clears 4 advisories; patched at ≥ 8.5.23           |
| `nanoid`  | `^3.3.18` | Clears 2 high advisories; patched at ≥ 3.3.18      |
| `sharp`   | `^0.35.3` | Clears inherited libvips CVEs; patched at ≥ 0.35.0 |

These are forward pins to patched releases, not version freezes. Each should be removed once the
upstream `next` dependency range resolves to a patched version on its own.

## Inventory

### Apache-2.0 (4)

| Package                   | Version |
| ------------------------- | ------- |
| `@img/sharp-darwin-arm64` | 0.35.3  |
| `@swc/helpers`            | 0.5.15  |
| `detect-libc`             | 2.1.2   |
| `sharp`                   | 0.35.3  |

### MIT (14)

| Package                  | Version  |
| ------------------------ | -------- |
| `@img/colour`            | 1.1.0    |
| `@next/env`              | 15.5.23  |
| `@next/swc-darwin-arm64` | 15.5.23  |
| `@types/node`            | 20.19.43 |
| `client-only`            | 0.0.1    |
| `nanoid`                 | 3.3.18   |
| `next`                   | 15.5.23  |
| `postcss`                | 8.5.26   |
| `react`                  | 19.2.7   |
| `react-dom`              | 19.2.7   |
| `scheduler`              | 0.27.0   |
| `styled-jsx`             | 5.1.6    |
| `undici-types`           | 6.21.0   |
| `zod`                    | 3.25.76  |

### ISC (3)

| Package        | Version |
| -------------- | ------- |
| `lucide-react` | 1.24.0  |
| `picocolors`   | 1.1.1   |
| `semver`       | 7.8.5   |

### BSD-3-Clause (1)

| Package         | Version |
| --------------- | ------- |
| `source-map-js` | 1.2.1   |

### 0BSD (1)

| Package | Version |
| ------- | ------- |
| `tslib` | 2.8.1   |

### CC-BY-4.0 (1)

| Package        | Version      |
| -------------- | ------------ |
| `caniuse-lite` | 1.0.30001803 |

### LGPL-3.0-or-later (1)

| Package                           | Version |
| --------------------------------- | ------- |
| `@img/sharp-libvips-darwin-arm64` | 1.3.2   |

## Vulnerability status

`pnpm audit --prod` reports **no known vulnerabilities** against this tree as of 2026-08-15.

This inventory reflects package identity and licensing; it is not a substitute for a continuous
vulnerability feed, and it is a point-in-time snapshot that must be regenerated alongside any
lockfile change.

`pnpm audit --prod` and `pnpm licenses:check` run as blocking jobs on every pull request and again on
a weekly schedule, so an advisory published against an unchanged tree is found here rather than by a
customer. See [OpenSource.md](./OpenSource.md).
