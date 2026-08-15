# Changelog

All notable changes to Decionis CDI are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Pre-1.0 stability:** contracts in `domain/` may change without a deprecation period until the first
`1.0.0` release. Treat a minor version bump before 1.0 as potentially breaking, and pin exactly if
you integrate against these types.

## [Unreleased]

Nothing yet.

## [0.1.0] — 2026-08-15

First tagged release. The application itself — demo and live data modes, the portfolio dashboard, the
opportunity review queue, and account evidence detail — was already built; this release is where it
became something that can be handed to someone outside the team.

### Added

- Apache-2.0 licensing: `LICENSE`, `NOTICE`, and complete `package.json` metadata. The missing
  `license` field had been reported by SCA tooling as "license unknown".
- `ThirdPartyLicenses.md` — inventory of every production dependency by license, with the LGPL and
  CC-BY entries explained rather than left for a reviewer to derive.
- `scripts/CheckLicensePolicy.mjs` and `pnpm licenses:check` — fails the build on a production
  dependency outside the approved license set.
- CI: `pnpm verify` on Node 20 and 22; a supply-chain gate running `pnpm audit --prod`,
  `pnpm audit --audit-level high` and the license policy on every pull request and weekly; CodeQL;
  OpenSSF Scorecard.
- Release pipeline producing a deployable tarball, a CycloneDX SBOM generated from the assembled
  bundle, and a signed SLSA build-provenance attestation.
- Nonce-based Content-Security-Policy, applied by `middleware.ts` to every response in both data
  modes and to refusals as well as successes.
- Test coverage for the security-critical paths — session middleware, session and role resolution,
  the upstream HTTP client, API error mapping, and the server/client component boundary. 11 tests
  became 79.
- `SECURITY.md`, `ThreatModel.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS`, and issue
  and pull request templates.
- `EvidencePack.md` — the artifact index for a vendor security review.
- `PublicLaunch.md` — the ordered runbook for making the repository public.
- `Dockerfile` and `.dockerignore` — multi-stage, non-root, with a health check.
- `.github/dependabot.yml` — grouped weekly updates for npm and GitHub Actions. Dependabot had been
  running unconfigured, which produced four consecutive failed security-update jobs.
- README screenshots, and `pnpm screenshots` to regenerate them from a running instance.

### Changed

- `next` to `15.5.23`, with `pnpm.overrides` pinning `postcss`, `nanoid`, and `sharp` above their
  vulnerable ranges. These are forward pins to patched releases, not version freezes; remove each once
  the upstream `next` range resolves past it on its own.
- README rewritten for an audience evaluating the project rather than one already inside it.
- `/sign-in` is now matched by the session middleware. It had been excluded to avoid a redirect loop,
  which also left the one page every unauthenticated visitor reaches without a security policy.
- The OpenSSF Scorecard workflow is manual-only until the repository is public; its GraphQL queries
  are unavailable to the default token on a private repository.

### Removed

- `@decionis-ai/sdk` — declared as a dependency but imported by no source file.

### Security

- Resolved 15 known advisories in the production dependency tree (8 high, 7 moderate), all reachable
  through `next` and its transitive dependencies.
- Resolved 10 advisories in the development tree (1 critical, 6 high, 3 moderate) — `vitest` to 3.x,
  plus overrides pinning `vite`, `esbuild`, `js-yaml`, and `brace-expansion`.
- The CI audit gate now covers the build toolchain as well as the production tree, at high and
  critical severity. Auditing production only had been hiding a critical in the test runner.
- `gitleaks` across all refs reports no secrets in git history. Only `.env.example` was ever
  committed, and its service-token field is empty.

[unreleased]: https://github.com/decionis/cdi/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/decionis/cdi/releases/tag/v0.1.0
