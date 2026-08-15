# Open Source Implementation Plan

Taking `decionis/cdi` public under **Apache-2.0**, optimized for the audience that actually decides
whether this repository helps or hurts: the security, legal, and procurement reviewers at a regulated
fintech evaluating Decionis as a vendor.

## What this plan optimizes for

An enterprise buyer does not browse the repository the way an open-source contributor does. A
contributor asks "can I run this and is the maintainer responsive?" A buyer's reviewer asks a
different set of questions, and asks them with tooling:

- What license, and does it carry a patent grant? (Apache-2.0 — settled.)
- What is in the dependency tree, under what licenses, with what known CVEs?
- Is there a disclosure policy and a stated response time?
- Is the build reproducible and the release chain attestable?
- Do the security claims in the marketing hold up when I read the code?

That last one is the opportunity. CDI's pitch is that operator reviews are governed, attributable,
and non-authoritative — and unlike almost every vendor making that claim, we can let the buyer read
the enforcement. A reviewer who opens `middleware.ts`, `CdiSessionResolver`, and `OpportunityService`
and finds the boundary exactly where the sales deck said it was is a reviewer who stops asking.

The corollary is that everything in this repository is now evidence in a vendor security review.
That raises the cost of the findings below considerably.

## Verified findings

Measured against the current tree this session, not estimated.

| Finding                                                                                   | Severity for a buyer   | Status        |
| ----------------------------------------------------------------------------------------- | ---------------------- | ------------- |
| 15 known vulnerabilities in the production tree — 8 high, 7 moderate                      | Blocker                | ✅ Fixed      |
| `package.json` has no `license`, `repository`, `description`, or `author` field           | Blocker                | ✅ Fixed      |
| No `LICENSE` file, so the code is all-rights-reserved                                     | Blocker                | ✅ Fixed      |
| LGPL-3.0-or-later present in the production tree (`@img/sharp-libvips-*`)                 | High — needs an answer | ✅ Documented |
| No CI or audit enforcement                                                                | High                   | ✅ Fixed      |
| **No branch protection; no signed or attested releases**                                  | **High**               | Open          |
| Auth and gateway paths (`middleware.ts`, `CdiSessionResolver`, `JsonHttpClient`) untested | High                   | ✅ Fixed      |
| No `SECURITY.md`, no disclosure policy, no response-time commitment                       | High                   | ✅ Fixed      |
| SDK dependency `@decionis-ai/sdk` declared but imported nowhere                           | Medium                 | Open          |

Two open questions from the previous plan are now answered:

- **`@decionis-ai/sdk` is publicly installable** from the default npm registry and is MIT-licensed.
  It is not a barrier to outside installs. It is still dead weight — no source file imports it.
- **Its repository field points to `github.com/orepos/Decionis`**, not a `decionis` org. A reviewer
  tracing provenance from `decionis/cdi` → `@decionis-ai/sdk` → an unrelated-looking GitHub org will
  raise it. Align the org or be ready to explain it.

### The vulnerability finding — resolved

All 15 advisories collapsed into four root packages. Remediation landed in one dependency bump plus
three transitive overrides:

| Package   | Was     | Now     | Advisories cleared    | How                      |
| --------- | ------- | ------- | --------------------- | ------------------------ |
| `next`    | 15.5.20 | 15.5.23 | 3 high, 4 moderate    | Direct bump, patch-level |
| `postcss` | 8.4.31  | 8.5.26  | 2 high, 2 moderate    | `pnpm.overrides`         |
| `nanoid`  | 3.3.15  | 3.3.18  | 2 high                | `pnpm.overrides`         |
| `sharp`   | 0.34.5  | 0.35.3  | 1 high (libvips CVEs) | `pnpm.overrides`         |

`pnpm audit --prod` now reports **no known vulnerabilities**, and `pnpm verify` passes end to end —
format, lint, typecheck, the full test suite, and a clean production build of all 9 routes.

The overrides are forward pins, not freezes. Remove each one as the upstream `next` range resolves to
a patched version on its own; the weekly audit job in W2.3 is what will tell you when.

Retained here because it is the argument for W2.3: a buyer's reviewer runs `pnpm audit` in the first
ten minutes of due diligence, and eight high-severity findings on a repository whose entire premise
is governed, auditable decision-making is a credibility problem no documentation offsets. The tree is
clean today; **only a blocking CI job keeps it clean.**

## Workstreams

Sequenced by dependency, not by size. W1 and W2 are prerequisites for going public at all.

### W1 — License and IP hygiene ✅ Done

Copyright holder: **Decionis, Inc.**, a Delaware corporation. Landed:

1. ✅ **`LICENSE`** — the canonical Apache License 2.0, copied byte-for-byte and left unmodified,
   appendix included. The copyright line lives in `NOTICE` rather than in the appendix, which is the
   ASF's own convention and keeps the license text verifiably unaltered against the upstream hash.
2. ✅ **`NOTICE`** — `Copyright 2026 Decionis, Inc.`, with the standard Apache attribution block and
   a pointer to the third-party inventory.
3. ✅ **`package.json` metadata** — added `license`, `description`, `author`, `homepage`,
   `repository`, and `bugs`. Small change, outsized effect: SCA platforms (Black Duck, FOSSA, Snyk)
   read the `license` field, and its absence was being reported as **"license unknown"** — treated in
   regulated procurement as worse than a restrictive license, because it cannot be cleared.
   `"private": true` is retained; the README now explains that it prevents accidental npm publication
   and does not restrict use under Apache-2.0.
4. ✅ **`ThirdPartyLicenses.md`** — all 26 production packages inventoried by license: 15 MIT,
   4 Apache-2.0, 3 ISC, 1 BSD-3-Clause, 1 0BSD, 1 CC-BY-4.0, 1 LGPL-3.0-or-later. Handing a buyer
   this file unprompted removes a full round-trip from their review. It notes that `@img/sharp-*` and
   `@next/swc-*` are platform-conditional, so a deployment-accurate SBOM must be regenerated on the
   target platform — pre-empting a "your SBOM doesn't match your container" objection.
   **Regenerate this in CI** so it cannot drift from the lockfile (carried into W2).
5. ✅ **The LGPL answer is written down** in `ThirdPartyLicenses.md`:
   `@img/sharp-libvips-*` is a separate, unmodified, dynamically-linked platform binary — the
   arrangement LGPL §4 permits without reciprocal obligation — and **`next/image` is confirmed unused
   anywhere in this source tree**, so the dependency can be excluded at build time with no loss of
   functionality. That turns a legal objection into a build flag.

Remaining, and deliberately deferred:

6. **DCO, not a CLA.** Apache-2.0 §5 already licenses inbound contributions under the same terms, so
   a CLA buys little unless relicensing is foreseeable, and it measurably suppresses contribution.
   Enforce `git commit -s` with the DCO GitHub App — needs repo admin, lands with W5.
7. **Per-file copyright headers — recommend skipping.** Standard npm-ecosystem practice is
   `LICENSE` + `NOTICE` + the `package.json` field, which is what SCA tooling reads. Add headers only
   if a named buyer's policy demands them; if so, enforce with an ESLint rule rather than by hand.

### W2 — Vulnerability and supply-chain posture

This is where an enterprise buyer's opinion is actually formed.

1. ✅ **Clear the 15 advisories — done.** `next` bumped to `^15.5.23`, `pnpm.overrides` added for
   `postcss`, `nanoid`, and `sharp`, lockfile refreshed. `pnpm audit --prod` is clean and
   `pnpm verify` passes including the production build. Details in the findings section above.
   **This state is not self-sustaining** — without item 3 below, the next advisory is discovered by a
   buyer rather than by us.
2. ✅ **CI on every PR and push — done.** `.github/workflows/verify.yml` runs `pnpm verify` on Node 20
   and 22 with a pnpm cache and `--frozen-lockfile`, so a dependency change cannot land without its
   lockfile. Node 20 is the floor declared in `engines`; the matrix tests what we promise.
3. ✅ **Audit as a blocking job — done.** `.github/workflows/audit.yml` runs `pnpm audit --prod` and
   `pnpm licenses:check` on every pull request, weekly on Mondays at 06:00 UTC, and on demand. The
   scheduled run opens a tracking issue on failure and comments on the existing one rather than
   filing duplicates — a scheduled job that only turns a tab red is a job nobody sees.

   The license gate ([CheckLicensePolicy.mjs](../scripts/CheckLicensePolicy.mjs)) asserts that every
   production dependency carries an approved license, with package-scoped exceptions for the two
   non-permissive entries already documented. It is a **policy gate rather than a diff check** by
   design: the generated inventory is platform-conditional, so a regenerate-and-compare check would
   fail permanently on a Linux runner against a macOS-generated file. Asserting the license set is
   platform-independent and is the property a reviewer actually cares about.

4. **Branch protection on `master`** — required checks, required review, linear history. **Needs repo
   admin; the workflows above do nothing until their checks are marked required.**
5. ✅ **Every GitHub Action pinned by commit SHA**, not tag, with the version in a trailing comment.
   Tags are mutable; a governance product that resolves build steps by moving reference undercuts its
   own supply-chain story.
6. **SBOM per release** — CycloneDX JSON attached to the GitHub release. Increasingly a hard
   procurement requirement rather than a differentiator, and it is one CI step.
7. **Build provenance** — SLSA attestation via `actions/attest-build-provenance`. If anything is ever
   published to npm, use `--provenance`.
8. **Enable CodeQL, secret scanning, and push protection** at the repo level so history stays clean
   after launch.
9. **Publish the OpenSSF Scorecard badge** once the above lands. It gives procurement a third-party
   number to cite instead of taking our word for the posture — which is the entire point of doing
   this in the open.

### W3 — Security assurance artifacts ✅ Done (pending two sign-offs)

1. ✅ **[`SECURITY.md`](../SECURITY.md)** — GitHub Security Advisories as the primary private channel,
   with a secondary email. Named in GitHub's exact uppercase convention so the Security tab and the
   "Report a vulnerability" affordance pick it up; this is an ecosystem-required filename, the same
   exemption `page.tsx` and the workflow files get. Scope is explicit in three directions: what to
   report here, what routes to the platform contact instead, and **what we will not accept as a
   vulnerability** — chiefly the demo operator's privileges, which are intended behaviour, while
   demo mode being _reachable in production_ is in scope and serious.
2. ✅ **[`ThreatModel.md`](../ThreatModel.md)** — seven threats (T1–T7), each with its mitigation, the
   file that implements it, and the test that proves it. Assets, trust boundaries, and an
   **accepted-risk section**, because a threat model listing only mitigations is marketing.
3. ✅ **Security headers documented** — the seven headers in `next.config.ts` were good and entirely
   invisible; they are now tabulated with the reason for each. The **missing CSP** is recorded as the
   most significant known gap rather than left for a reviewer to find.
4. ✅ **Data-handling statement** — no telemetry, no analytics, no third-party scripts, no customer
   data at rest, no cookies set by this application. For a fintech buyer this is a fast "no" to
   several questionnaire rows, and it is true by construction: this tier has no database.

Verification done while writing it, rather than asserted: the app sets no cookies, the server tier
makes no outbound request to any host but `DECIONIS_API_BASE_URL`, and the session-carrying component
chain is entirely server-side. That last one is now enforced by `ServerClientBoundary.test.ts` — see
W4.

**Three sign-offs before this goes public:**

- **Private vulnerability reporting must be enabled** in repository settings (Settings → Code security
  → Private vulnerability reporting). `SECURITY.md` names GitHub Security Advisories as the primary
  channel; until that setting is on, the "Report a vulnerability" link 404s and the documented process
  does not exist. Needs repo admin.
- **`security@decionis.com` must exist and be monitored.** A disclosure address that bounces is worse
  than none; it converts a responsible reporter into a public one. The same applies to the Decionis
  platform security contact that `SECURITY.md` routes out-of-scope reports to — it is referenced but
  not yet named, and should be before launch.
- **The response targets are a proposal, not a commitment** — 2 business days to acknowledge,
  5 to assess, 30 days for high/critical, 90 for low/medium. Confirm or change them. A missed public
  SLA does more damage than a slower published one.

### W4 — Make the claims verifiable ✅ Done

The security story is only as strong as the code a reviewer opens to check it. All four
security-critical paths are now covered. **69 tests across 10 files, up from 11 across 5.**

| File                    | Tests | Covers                                                                                                                                                  |
| ----------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `middleware.ts`         | 13    | Demo pass-through, live gating, 401-vs-redirect, `/api/health` exemption, partial and empty cookies, configured cookie names, the matcher as a boundary |
| `CdiSessionResolver.ts` | 20    | Role parsing, the `VIEWER` privilege floor, bearer-over-cookie and header-over-cookie precedence, service-token fallback, demo-session isolation        |
| `JsonHttpClient.ts`     | 13    | Credential placement, `no-store`, schema enforcement at the boundary, gateway error mapping, timeout and abort                                          |
| `CdiApiErrorMapper.ts`  | 8     | Status mapping for every error type, out-of-range clamping to 502, and that an unrecognized error leaks no internals                                    |
| Server/client boundary  | 4     | That no client component references `CdiSession` or a token field, and that every session-holding component stays server-side                           |

The boundary guard came out of writing the threat model. `AppShell` takes the whole `CdiSession`,
which carries `accessToken`; under React Server Components, any prop crossing into a client component
is serialized into the browser payload. Adding `"use client"` to `AppShell` would ship the access
token in every page render **without failing typecheck or any behavioural test**. The invariant is
now asserted structurally, and mutation-tested: marking `AppShell` as a client component fails 2 of
the 4 guards.

Three properties are worth pointing a reviewer at directly, because they are the ones a questionnaire
asks about and they are now executable rather than asserted:

- **The credential never reaches the URL.** `JsonHttpClient` asserts the token appears in the
  `Authorization` header and nowhere in the request URL — query strings leak into proxy logs,
  browser history, and referrer headers.
- **The privilege floor holds.** An unparseable, hostile, or wrong-case role claim resolves to
  `VIEWER`, never to an empty role set that a downstream check could misread. `admin` does not
  become `ADMIN`.
- **Errors do not leak internals.** An unrecognized exception maps to a generic 500; the test asserts
  the response body contains no trace of the original message.

**The suite was mutation-tested rather than trusted.** Weakening the middleware session check from
`&&` to `||` fails 3 tests; broadening the `/api/health` exemption to all `/api/` paths fails 6;
replacing the `VIEWER` fallback with `ADMIN` fails 2. A suite that cannot fail is decoration, and on
an authorization path that is worse than no suite at all.

Still open from this workstream: the 8s gateway timeout remains hardcoded in `CdiRuntimeConfig`.
Make it configurable or document it as deliberate.

### W5 — Contributor surface

Smaller than it would be for a framework, because the realistic contribution profile is UI,
accessibility, docs, and deployment recipes — not core changes.

- **`Contributing.md`** — Node 20+/pnpm 9, the demo-mode loop, `pnpm verify` as the gate, the
  PascalCase-except-framework-files convention, DCO sign-off, and a **"changes we will not accept"**
  section naming the trust boundary. Anyone proposing that CDI evaluate policy locally should learn
  that from a document, not from a closed PR.
- **`CodeOfConduct.md`** — Contributor Covenant 2.1 with a real reporting address.
- **`.github/CODEOWNERS`** — mandatory review on `domain/`, `infra/auth/`, `infra/api/`, and
  `middleware.ts`. These encode the boundary and must not merge on a drive-by approval.
- **Issue and PR templates.** The bug template must ask for the data mode; demo vs live is the first
  question on every report.
- **Remove the unused `@decionis-ai/sdk` dependency**, or import it where the gateway should be using
  it. An unused SDK is the first thing a reviewer greps for.

### W6 — Launch

- **Screenshots in the README** — the largest remaining documentation gap for a product that is
  entirely a UI.
- **A public demo deployment** on `CDI_DATA_MODE=demo`. The app already builds `output: "standalone"`,
  so this is nearly free. Note `next.config.ts` sets `X-Robots-Tag: noindex`; drop it on the demo host
  only if discoverability matters.
- **An evidence pack** (below) — the actual sales artifact this whole plan produces.
- **Semver from 0.1.0**, `Changelog.md`, tagged releases. State plainly that `domain/` contracts may
  break before 1.0.
- Announce only after W1–W4 are done. The repository gets one first impression, and the buyers who
  look earliest are the ones who matter most.

## Sequencing

| Stage         | Work                    | Gate to clear before proceeding                                 |
| ------------- | ----------------------- | --------------------------------------------------------------- |
| **1. Now**    | W2.1 vulnerability fix  | `pnpm audit --prod` clean; `pnpm verify` green                  |
| **2. Legal**  | W1 (needs entity name)  | LICENSE + NOTICE merged, `package.json` metadata complete       |
| **3. Harden** | W2.2–W2.9, W3           | CI blocking on `master`; `SECURITY.md` live with a real contact |
| **4. Prove**  | W4                      | Auth and gateway paths under test                               |
| **5. Open**   | W5, then flip to public | Scaffolding merged, CODEOWNERS enforced                         |
| **6. Launch** | W6                      | Evidence pack assembled                                         |

Stages 1 and 2 can run concurrently — one is engineering, the other is legal turnaround. **Do not
flip the repository to public before stage 3 completes.** A public repository with failing CI, or
none, is the impression that sticks, and for this buyer it is the impression that costs the deal.

## The evidence pack

The deliverable that makes this plan pay for itself. Once W1–W3 land, a Decionis salesperson facing a
security questionnaire can send one set of links instead of scheduling a call:

| Buyer asks                       | Send                                                            |
| -------------------------------- | --------------------------------------------------------------- |
| Licensing and patent terms       | `LICENSE`, `NOTICE`, `ThirdPartyLicenses.md`                    |
| Dependency and CVE posture       | SBOM, the passing audit job, OpenSSF Scorecard                  |
| Vulnerability disclosure process | `SECURITY.md` with the response target                          |
| Architecture and data handling   | `Architecture.md`, the threat model, the no-telemetry statement |
| "Prove the boundary is real"     | `middleware.ts`, `OpportunityService`, and their tests          |

Most vendors answer that last row with a diagram. Answering it with source code a buyer can read and
a test suite they can run is the reason to do any of this.

## Inputs needed

| Input                       | Needed for                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Exact legal entity name** | The `LICENSE` and `NOTICE` copyright line. This is the one hard blocker on W1 — a placeholder copyright is worse than no file. |
| Security contact address    | `SECURITY.md`, and it must be monitored                                                                                        |
| Disclosure response target  | What we will actually honour, not what sounds good                                                                             |
| Demo hosting owner          | Who owns uptime for the public demo                                                                                            |
| Named buyer LGPL policy     | Only if one prohibits LGPL outright — then W1.5 becomes engineering work                                                       |
