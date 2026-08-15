# Public Launch Runbook

Making `decionis/cdi` public is one coordinated change, not a setting. Several things are impossible
while the repository is internal and become available the moment it is public; several others must be
true **before** the flip, because the flip exposes every commit ever made and cannot be meaningfully
undone.

[OpenSource.md](./OpenSource.md) is the plan and its record of what was found. This is the sequence.

## Why the ordering matters

Flipping to public is close to irreversible in the way that matters: history is exposed the instant it
happens, and making the repository private again does not un-copy anything a crawler already has.
Everything under "before" is therefore a gate, not a preference.

Conversely, four things **cannot** be done in advance — GitHub gates them on public visibility, and
attempts fail with a 404 or a permissions error:

- Private vulnerability reporting (GHSA)
- OpenSSF Scorecard `publish_results`, and therefore the badge
- CodeQL code scanning without a Code Security entitlement
- Public forks, stars, and community-health scoring

Do not treat their absence today as an oversight. They are stage two.

## Before the flip

### Verified

- ✅ **No secrets in git history.** `gitleaks git --log-opts="--all"` reports no leaks across all
  commits and refs. Re-run immediately before flipping; the guarantee is only as fresh as the scan.
- ✅ **No environment file was ever committed.** Only `.env.example`, whose
  `DECIONIS_CDI_SERVICE_TOKEN` is empty. No file that is gitignored today was ever tracked.
- ✅ **Licensing.** Apache-2.0, `NOTICE`, complete `package.json` metadata, and a third-party
  inventory with the LGPL and CC-BY entries answered in advance.
- ✅ **Supply chain.** `pnpm audit --prod` and `pnpm audit --audit-level high` both clean; license
  policy enforced in CI; every action SHA-pinned; SBOM and signed SLSA provenance on release.
- ✅ **Branch protection.** Pull request, code-owner review, and required status checks
  (`verify (node 20)`, `verify (node 22)`, `audit`) all enforcing.
- ✅ **Secret scanning and push protection** enabled.

### Still required — human sign-off, not engineering

- [ ] **Demo fixture sign-off.** Someone with the authority to say so confirms in writing that no
      account name, corridor, processing limit, or external reference in `infra/demo/DemoCdiData.ts`
      derives from a real customer, and that no fixture resembles a nameable one. This is the single
      file in the repository shaped like real customer data, and it is about to be world-readable.
- [ ] **Trademark and naming review.** "Decionis", "Adaptive Customer Decision Intelligence", and the
      `@decionis` npm scope go public with the repository. Confirm the marks are held and that the
      README's product claims are ones marketing and legal will stand behind.
- [ ] **Confirm the disclosure response targets** in `SECURITY.md` — 2 business days to acknowledge,
      5 to assess, 30 days for high/critical, 90 for low/medium — are commitments the team will
      honour. A missed public SLA does more damage than a slower published one.
- [ ] **Name the Decionis platform security contact.** `SECURITY.md` routes out-of-scope reports "to
      the Decionis platform security contact" without saying who that is, which makes the instruction
      unactionable.
- [ ] **Decide on the `code_scanning` and `code_coverage` ruleset rules.** Both currently wait on
      signals this repository does not produce. Enabling Code Security resolves the first; the second
      needs `pnpm test --coverage` and a reporter, or the rule should be removed. A gate waiting on a
      signal that never arrives is indistinguishable from a gate that is off.

## The flip

Run these in order. Steps 2–6 are a single pull request.

### 1. Re-scan, then flip visibility

```bash
gitleaks git --log-opts="--all"          # must report: no leaks found
gh repo edit decionis/cdi --visibility public --accept-visibility-change-consequences
```

### 2. Enable private vulnerability reporting

Now possible, and `SECURITY.md` depends on it:

```bash
gh api -X PUT repos/decionis/cdi/private-vulnerability-reporting
gh api repos/decionis/cdi/private-vulnerability-reporting --jq '.enabled'   # expect: true
```

### 3. Point disclosure at GHSA

In [`SECURITY.md`](./SECURITY.md), make GitHub Security Advisories the primary channel and email the
fallback, and delete the note explaining that the advisory form does not exist yet.

In [`.github/ISSUE_TEMPLATE/config.yml`](.github/ISSUE_TEMPLATE/config.yml), restore the direct link
and remove the comment above it:

```yaml
url: https://github.com/decionis/cdi/security/advisories/new
```

### 4. Turn Scorecard back on

In [`.github/workflows/scorecard.yml`](.github/workflows/scorecard.yml): uncomment the
`branch_protection_rule`, `push`, and `schedule` triggers, set `publish_results: true`, and delete the
"MANUAL-ONLY UNTIL THIS REPOSITORY IS PUBLIC" block. No PAT is needed once public.

Then add the badge to the top of `README.md`:

```markdown
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/decionis/cdi/badge)](https://scorecard.dev/viewer/?uri=github.com/decionis/cdi)
```

The badge is the point of the exercise — it lets procurement cite a third-party number instead of
taking our word for the posture.

### 5. Make CodeQL blocking

CodeQL is free on public repositories, so the entitlement problem disappears. In
[`.github/workflows/codeql.yml`](.github/workflows/codeql.yml), remove `continue-on-error: true` from
the analyze step and delete the "Report analysis outcome" step that exists only to explain the
missing entitlement. Then add `analyze` to the required status checks:

```bash
gh api repos/decionis/cdi/rulesets/20883088 | jq 'def stripnulls: walk(if type == "object" then with_entries(select(.value != null)) else . end); . as $r | {name,target,enforcement,conditions,bypass_actors, rules: (($r.rules | map(select(.type != "required_status_checks"))) + [{type:"required_status_checks",parameters:{strict_required_status_checks_policy:false,do_not_enforce_on_create:false,required_status_checks:[{context:"verify (node 20)"},{context:"verify (node 22)"},{context:"audit"},{context:"analyze"}]}}])} | stripnulls' | gh api -X PUT repos/decionis/cdi/rulesets/20883088 --input -
```

`stripnulls` is not optional. GitHub's `GET` returns `code_coverage.max_coverage_drop: null` and its
`PUT` rejects null there, so writing a ruleset back unchanged fails with a 422. Check `bypass_actors`
survives — losing it locks the sole maintainer out.

### 6. Update the framing

`README.md` and `OpenSource.md` both describe an internal repository in places. The project status
section should stop saying the code "is not yet open source".

## After the flip

- [ ] **Watch the first Scorecard run** and treat the score as a to-do list rather than a grade.
      Expect points lost on Signed-Releases until a tag exists, and on Contributors while there is one
      maintainer.
- [ ] **Cut `v0.1.0`.** The release pipeline has been proven with `workflow_dispatch -f dry_run=true`;
      a tag exercises the publish path for real. Verify the attestation from a clean directory:

      ```bash
          gh attestation verify decionis-cdi-0.1.0.tar.gz --repo decionis/cdi
          ```

- [ ] **Stand up the public demo** on `CDI_DATA_MODE=demo` using the [Dockerfile](./Dockerfile).
      `next.config.ts` sets `X-Robots-Tag: noindex, nofollow, noarchive`; drop that header on the demo
      host only if discoverability matters.
- [ ] **Announce.** Not before the above. The repository gets one first impression, and the buyers who
      look earliest are the ones who matter most.

## What not to do

- **Do not flip first and tidy after.** Every item under "Before the flip" exists because it is
  cheaper than a retraction.
- **Do not add a PAT to make Scorecard work early.** A long-lived classic token stored as a secret is
  a real supply-chain liability, bought for a score nobody can see until launch.
- **Do not remove the maintainer bypass without a second maintainer.** GitHub does not permit
  approving your own pull request; with one code owner and required review, removing the bypass
  deadlocks the repository entirely.
- **Do not let the "accepted risk" sections quietly shrink.** `ThreatModel.md` and `EvidencePack.md`
  state what is missing — no penetration test, no SOC 2 in this tier, no rate limiting. A reviewer
  finds gaps faster than we can hide them, and a vendor that states its own is easier to trust on the
  rest.
