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
| No signed or attested releases, no SBOM                                                   | High                   | ✅ Fixed      |
| Branch protection — PR + code-owner review enforced                                       | High                   | ✅ Fixed      |
| **Required status checks absent, so a PR can merge with CI red**                          | **High**               | **Open**      |
| Dependabot security updates disabled; `dependencies` label missing                        | High                   | ✅ Fixed      |
| **Push protection and private vulnerability reporting still disabled**                    | **High**               | **Open**      |
| CODEOWNERS named GitHub teams that do not exist, so no PR could be merged                 | Blocker                | ✅ Fixed      |
| **Sole code owner cannot approve their own PR — repository still deadlocks**              | **Blocker**            | **Open**      |
| 10 advisories in the dev tree the production-only audit did not cover                     | High                   | ✅ Fixed      |
| Auth and gateway paths (`middleware.ts`, `CdiSessionResolver`, `JsonHttpClient`) untested | High                   | ✅ Fixed      |
| No `SECURITY.md`, no disclosure policy, no response-time commitment                       | High                   | ✅ Fixed      |
| SDK dependency `@decionis-ai/sdk` declared but imported nowhere                           | Medium                 | ✅ Fixed      |

Two open questions from the previous plan are now answered:

- **`@decionis-ai/sdk` was publicly installable** from the default npm registry and MIT-licensed, so
  it was never a barrier to outside installs — just dead weight, since no source file imported it.
  Removed in W5.
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
4. ✅ **`ThirdPartyLicenses.md`** — all 25 production packages inventoried by license: 14 MIT,
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
   `CONTRIBUTING.md` and the PR template now document `git commit -s`; **installing the DCO GitHub
   App to enforce it still needs repo admin.**
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
3. ✅ **Audit as a blocking job — done, and since widened.** `.github/workflows/audit.yml` runs on
   every pull request, weekly on Mondays at 06:00 UTC, and on demand. The scheduled run opens a
   tracking issue on failure and comments on the existing one rather than filing duplicates — a
   scheduled job that only turns a tab red is a job nobody sees.

   It originally audited the **production tree only**, on the reasoning that dev tooling is not
   redistributed. That reasoning was incomplete and this plan was wrong to settle for it: dev
   dependencies execute on the CI runner with access to the token and the source. The gap was found
   the way gaps usually are — four failed Dependabot security jobs pointed at `js-yaml`, and checking
   why turned up **10 advisories in the dev tree (1 critical, 6 high, 3 moderate)** while
   `pnpm audit --prod` reported clean.

   Two audits now run, with deliberately different thresholds:

   | Scope                           | Threshold         | Why                                                                   |
   | ------------------------------- | ----------------- | --------------------------------------------------------------------- |
   | `pnpm audit --prod`             | any severity      | This is what ships                                                    |
   | `pnpm audit --audit-level high` | high and critical | Build toolchain; moderate churn would train people to ignore the gate |

   Both are clean as of this change.

   The license gate ([CheckLicensePolicy.mjs](./scripts/CheckLicensePolicy.mjs)) asserts that every
   production dependency carries an approved license, with package-scoped exceptions for the two
   non-permissive entries already documented. It is a **policy gate rather than a diff check** by
   design: the generated inventory is platform-conditional, so a regenerate-and-compare check would
   fail permanently on a Linux runner against a macOS-generated file. Asserting the license set is
   platform-independent and is the property a reviewer actually cares about.

4. ⚠️ **Branch protection on `master` — active, but CI is still not required.** The ruleset
   "Decionis Protection Rules" is enforcing, with no bypass actors. Verified against the API rather
   than the settings UI, because a ruleset can look configured and enforce nothing:

   | Rule                            | State                                                  |
   | ------------------------------- | ------------------------------------------------------ |
   | Pull request required           | ✅ active                                              |
   | Approving reviews               | ✅ 1                                                   |
   | Code-owner review               | ✅ required — CODEOWNERS is live                       |
   | Bypass actors                   | ✅ none, so admins cannot merge around it              |
   | `deletion`, `non_fast_forward`  | ✅ active                                              |
   | **`required_status_checks`**    | ❌ **empty**                                           |
   | `code_scanning` (CodeQL, high+) | ⚠️ requires results CodeQL cannot produce (see item 8) |
   | `code_coverage` (80% minimum)   | ⚠️ this repository generates no coverage report at all |

   Direct pushes to `master` are genuinely blocked, which is the larger half. But **`verify (node 20)`,
   `verify (node 22)`, and `audit` are not required**, so a pull request can still merge with CI fully
   red provided a code owner approves. Add the **Require status checks to pass** rule naming those
   three contexts.

   The other two rules reference data that does not exist. `code_scanning` demands CodeQL results
   while Code Security is disabled, so CodeQL can never upload any; `code_coverage` demands 80% while
   `pnpm test` runs without `--coverage` and nothing is ever reported. Either enable the underlying
   capability or remove the rule — a gate waiting on a signal that never arrives is indistinguishable
   from a gate that is off, and harder to notice.

5. ✅ **Every GitHub Action pinned by commit SHA**, not tag, with the version in a trailing comment.
   Tags are mutable; a governance product that resolves build steps by moving reference undercuts its
   own supply-chain story. Verified across all five workflows.
6. ✅ **SBOM per release** — [`release.yml`](./.github/workflows/release.yml) generates a CycloneDX
   JSON SBOM with Syft and attaches it to the GitHub release. Generated **on the Linux build platform
   from the actually-resolved tree**, which is the point: the checked-in inventory is macOS-generated
   and platform-conditional, so only a build-time SBOM matches what ships.
7. ✅ **Build provenance** — the same workflow produces a signed SLSA attestation over the deployable
   tarball via `actions/attest-build-provenance`. A recipient verifies it with
   `gh attestation verify <tarball> --repo decionis/cdi`, which confirms the artifact came from this
   workflow and this commit rather than from someone's laptop. The release notes carry that command.
   Nothing is published to npm (`private: true`), so `--provenance` does not apply.
8. **Repository security settings — partially done, and the gaps are the interesting part:**

   | Setting                             | State                                                   |
   | ----------------------------------- | ------------------------------------------------------- |
   | Secret scanning                     | ✅ enabled                                              |
   | **Push protection**                 | ❌ **disabled** — secrets can still be pushed           |
   | **Dependabot security updates**     | ❌ **disabled**                                         |
   | **Private vulnerability reporting** | ❌ not enabled — `SECURITY.md`'s primary channel 404s   |
   | CodeQL workflow                     | ✅ [`codeql.yml`](./.github/workflows/codeql.yml) added |

   Secret scanning without push protection detects a leaked credential _after_ it is in history,
   which for a fintech repository about to go public is the expensive half. All four toggles need
   repo admin.

   **CodeQL runs but cannot publish.** Confirmed on the first PR run: the analysis completes — the
   database builds, every query runs, SARIF is exported — and then the upload is rejected with
   _"Code Security must be enabled for this repository to use code scanning."_ It is free on public
   repositories; on an internal one it needs the entitlement.

   The upload step is therefore `continue-on-error` with a loud warning annotation and a job summary,
   rather than either a permanently red check (which teaches people to ignore CI) or a silent pass
   (which is the "looks green, ran nothing" failure this plan already fixed once). **Remove
   `continue-on-error` as soon as Code Security is enabled**, so a genuine analysis failure blocks
   again. If the entitlement is not coming, delete the workflow and record that decision here — a
   check that silently finds nothing is worse than no check.

9. ✅ **OpenSSF Scorecard workflow added**, and deliberately not yet publishing.
   [`scorecard.yml`](./.github/workflows/scorecard.yml) runs weekly with `publish_results: false`,
   because publishing requires a **public** repository and this one is `internal`. **There is no
   badge yet** — flip `publish_results` and add the badge in the same change that makes the
   repository public. Several checks (Branch-Protection, Signed-Releases) return limited results
   until then, which also makes it a useful dry-run of how we will score.

### W3 — Security assurance artifacts ✅ Done (pending two sign-offs)

1. ✅ **[`SECURITY.md`](./SECURITY.md)** — GitHub Security Advisories as the primary private channel,
   with a secondary email. Named in GitHub's exact uppercase convention so the Security tab and the
   "Report a vulnerability" affordance pick it up; this is an ecosystem-required filename, the same
   exemption `page.tsx` and the workflow files get. Scope is explicit in three directions: what to
   report here, what routes to the platform contact instead, and **what we will not accept as a
   vulnerability** — chiefly the demo operator's privileges, which are intended behaviour, while
   demo mode being _reachable in production_ is in scope and serious.
2. ✅ **[`ThreatModel.md`](./ThreatModel.md)** — seven threats (T1–T7), each with its mitigation, the
   file that implements it, and the test that proves it. Assets, trust boundaries, and an
   **accepted-risk section**, because a threat model listing only mitigations is marketing.
3. ✅ **Security headers documented, and the CSP gap since closed** — the seven headers in
   `next.config.ts` were good and entirely invisible; they are now tabulated with the reason for each.
   Writing them up surfaced the missing Content-Security-Policy as the most significant known gap,
   which is the value of the exercise: **a nonce-based CSP now ships in `middleware.ts`**, applied on
   every response in both data modes. Production carries no `'unsafe-inline'` or `'unsafe-eval'` in
   `script-src`. Verified against a production build — all 21 script tags nonced, React hydrating, a
   review `POST` succeeding, no console violations.
4. ✅ **Data-handling statement** — no telemetry, no analytics, no third-party scripts, no customer
   data at rest, no cookies set by this application. For a fintech buyer this is a fast "no" to
   several questionnaire rows, and it is true by construction: this tier has no database.

Verification done while writing it, rather than asserted: the app sets no cookies, the server tier
makes no outbound request to any host but `DECIONIS_API_BASE_URL`, and the session-carrying component
chain is entirely server-side. That last one is now enforced by `ServerClientBoundary.test.ts` — see
W4.

Sign-off status:

- ✅ **`security@decionis.com` confirmed monitored.**
- ⚠️ **Private vulnerability reporting is still not enabled** (Settings → Code security → Private
  vulnerability reporting). `SECURITY.md` names GitHub Security Advisories as the **primary** channel;
  until that setting is on, the "Report a vulnerability" link 404s and a reporter falls back to email
  — or, worse, to a public issue. Needs repo admin.
- ⚠️ **The Decionis platform security contact is referenced but not named.** `SECURITY.md` routes
  out-of-scope reports "to the Decionis platform security contact" without saying who that is. Name
  it before launch, or the routing instruction is unactionable.
- ⚠️ **The response targets are still a proposal, not a commitment** — 2 business days to
  acknowledge, 5 to assess, 30 days for high/critical, 90 for low/medium. Confirm or change them.
  A missed public SLA does more damage than a slower published one.

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

### W5 — Contributor surface ✅ Done (pending two sign-offs)

Deliberately smaller than it would be for a framework, because the realistic contribution profile is
UI, accessibility, docs, and deployment recipes — not core changes. All community health files use
GitHub's uppercase convention so the platform surfaces them automatically, the same ecosystem-filename
exemption `page.tsx` and the workflows get.

- ✅ **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** — setup, the demo-mode loop, `pnpm verify` as the
  gate, conventions, DCO sign-off, and the dependency-policy rules. It **opens** with "What CDI is
  not", listing the five changes that will be declined regardless of implementation quality. Anyone
  proposing that CDI evaluate policy locally learns it from a document rather than from a closed PR,
  and is directed to open an issue first because it is a design conversation.
- ✅ **[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)** — Contributor Covenant 2.1, verbatim.
- ✅ **[`.github/CODEOWNERS`](./.github/CODEOWNERS)** — mandatory review on `middleware.ts`,
  `infra/auth/`, `infra/api/`, `infra/config/`, `domain/`, and `application/`, plus the supply-chain
  surfaces (`package.json`, the lockfile, `scripts/`, the workflows, and CODEOWNERS itself) because a
  change there can disable every check protecting the rest. Each entry carries a comment explaining
  what it guards.
- ✅ **Issue and PR templates.** The bug template's **first required field is the data mode** — demo
  versus live is the first question on every report, and the same symptom has different causes in
  each. Both issue templates open by routing security reports away from public issues, blank issues
  are disabled, and `config.yml` links GHSA and platform support directly. The PR template carries an
  explicit trust-boundary checkbox and a dependency checklist.
- ✅ **Removed the unused `@decionis-ai/sdk` dependency.** Confirmed no source file imported it.
  Production tree drops 26 → 25 packages. It is publicly installable and MIT-licensed, so it was
  never a barrier — just dead weight, and the first thing a reviewer greps for. If a real integration
  needs it, it comes back with the code that uses it.

Sign-off status:

- ✅ **`conduct@decionis.com` confirmed monitored.**
- ✅ **The `dependencies` label now exists**, so the scheduled audit job can file its tracking issue.
- ✅ **CODEOWNERS now names a real code owner.** It originally referenced
  `@decionis/cdi-maintainers` and `@decionis/cdi-security`, neither of which existed — both returned
  404 — so the ruleset's code-owner requirement could never be satisfied and **no pull request could
  merge at all**, including the ones closing the remaining gaps. It now names `@ocularminds`, who has
  admin access and is therefore a valid owner.

  Restore team-based ownership when there is a team to own it. **A team is only a valid code owner if
  it has write access to the repository** — creating it is not enough:

  ```bash
  gh api orgs/decionis/teams -f name='cdi-maintainers' -f privacy=closed
  gh api -X PUT orgs/decionis/teams/cdi-maintainers/repos/decionis/cdi -f permission=push
  gh api -X PUT orgs/decionis/teams/cdi-maintainers/memberships/<user> -f role=maintainer
  ```

- ⚠️ **A sole code owner still cannot merge their own work.** GitHub does not allow approving your own
  pull request, so with one code owner and required review the repository deadlocks on anything that
  owner authors. Pick one: add a second reviewer, add the maintainer to the ruleset's bypass list, or
  set required approvals to 0 and rely on the status checks. **The bypass list is the honest choice
  for a solo repository** — it says out loud that there is no second pair of eyes yet, rather than
  implying a review gate that cannot function. Revisit when a second maintainer exists.

### W6 — Launch — mostly done

- ✅ **[`EvidencePack.md`](./EvidencePack.md)** — the artifact this whole plan exists to produce.
  A questionnaire-row-to-artifact index, a table proving each boundary control with its file _and_
  its test, the commands a reviewer can run, and a section of fast answers that deliberately includes
  the weak ones: no CSP, no pen test, no SOC 2 in this tier. A reviewer finds gaps faster than we can
  hide them, and a vendor that states its own is easier to trust on the rest.
- ✅ **[`CHANGELOG.md`](./CHANGELOG.md)** — Keep a Changelog format, semver from 0.1.0, stating
  plainly that `domain/` contracts may break before 1.0.
- ✅ **Deployment recipe** — [`Dockerfile`](./Dockerfile) and `.dockerignore`, which is what makes a
  public demo deployment cheap. Multi-stage, `--frozen-lockfile` so the image cannot resolve a
  different tree than CI audited, non-root, telemetry off, `HEALTHCHECK` on `/api/health`.
  **Verified end to end**: image builds, container reports `healthy`, `/api/cdi/portfolio` serves
  `DEMO` with 4 accounts, `id` confirms uid 1000, security headers present and no `x-powered-by`.
- ✅ **README deployment section**, including the non-obvious part: `.next/standalone` is not
  self-sufficient — `next build` emits static assets separately and `.next/static` must be copied
  alongside the server.
- ✅ **The application itself was run and verified**, rather than described from the source. Demo mode
  matches what the README claims: the fixture operator renders as `ADMIN · APPROVER`, the `DEMO
EVIDENCE` badge is present, and every review control is captioned "Records a review only; no
  downstream limit is changed" — the trust boundary stated in the interface, not just in the docs.
  The BFF was exercised directly: `/api/health` open, portfolio `DEMO` with 4 accounts, a review
  returning a deterministic `HELD` plus dossier reference, and an invalid decision producing
  `400 INVALID_REQUEST` with Zod issues — `CdiApiErrorMapper` behaving in the running app exactly as
  its unit tests assert.

Still open:

- ✅ **Screenshots — delivered.** Three captures in `docs/`: the control center, the governed action
  queue, and account detail. Generated by [`scripts/CaptureScreenshots.mjs`](./scripts/CaptureScreenshots.mjs)
  via `pnpm screenshots`, so they can be refreshed rather than left to drift — a stale screenshot is a
  README that quietly lies. The script **refuses to run unless the server reports `dataStatus: DEMO`**,
  because these images are published and live mode would put real customer names and processing limits
  in them.
- **A public demo deployment.** The Dockerfile makes this a hosting decision rather than an
  engineering one. Note `next.config.ts` sets `X-Robots-Tag: noindex, nofollow, noarchive`; drop that
  header on the demo host only if discoverability matters.
- **Seed six to ten `good first issue`s** that are genuinely small and genuinely wanted —
  accessibility on the portfolio table, empty and error states, `CdiFormat` edge cases. An
  empty issue tracker converts nobody.
- **Prove the release pipeline before trusting a tag.** `release.yml` has never executed. Run it via
  `workflow_dispatch` with `dry_run: true` first; it uploads the tarball and SBOM as artifacts
  without publishing anything.
- **Announce only after everything in [PublicLaunch.md](./PublicLaunch.md) is done.** The
  repository gets one first impression, and the buyers who look earliest are the ones who matter
  most.

The flip itself is a single coordinated change with a strict ordering — several things cannot be done
until the repository is public, and several must be true before it is, because the flip exposes every
commit and cannot meaningfully be undone. That sequence lives in
[PublicLaunch.md](./PublicLaunch.md).

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
