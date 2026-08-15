# Evidence Pack

The artifact index for a vendor security review. When a prospect's security, legal, or procurement
team sends a questionnaire about Decionis CDI, this is what you send back — links to things they can
read and run, rather than a call.

Everything here is public in this repository. None of it requires a call, an NDA, or a screen share.

## The one-paragraph answer

Decionis CDI is the operator-facing tier of the Decionis platform. It renders customer evidence and
forwards operator reviews; it does **not** own policy evaluation, connector credentials, execution
grants, Decision Dossiers, or the audit ledger. It has no database, no session store, and no
customer data at rest. Because the tier is non-authoritative by construction, its source is public
under Apache-2.0 — a reviewer can verify the trust boundary rather than take our word for it.

## Answering the questionnaire

| They ask                                     | Send                                                                                           |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Licensing and patent terms                   | [LICENSE](./LICENSE) (Apache-2.0), [NOTICE](./NOTICE)                                          |
| Third-party components and their licenses    | [ThirdPartyLicenses.md](./ThirdPartyLicenses.md) — all 25 production packages, by license      |
| Copyleft or reciprocal obligations           | Same file, "Notes on non-permissive licenses" — the LGPL and CC-BY entries answered in advance |
| Known vulnerabilities in the dependency tree | [audit.yml](.github/workflows/audit.yml) — blocking on every PR plus weekly                    |
| SBOM                                         | CycloneDX JSON attached to each GitHub release by [release.yml](.github/workflows/release.yml) |
| Build integrity / artifact provenance        | Signed SLSA attestation per release; verify with the command below                             |
| Vulnerability disclosure process and SLA     | [SECURITY.md](./SECURITY.md)                                                                   |
| Architecture and data flow                   | [Architecture.md](./Architecture.md)                                                           |
| Threat model and residual risk               | [ThreatModel.md](./ThreatModel.md)                                                             |
| Data handling, telemetry, data residency     | [ThreatModel.md](./ThreatModel.md), "Data handling"                                            |
| Secure development practice                  | [CONTRIBUTING.md](./CONTRIBUTING.md), [CODEOWNERS](.github/CODEOWNERS)                         |
| **"Prove the boundary is real"**             | The table below                                                                                |

## Proving the boundary

Most vendors answer this with a diagram. This one answers it with source a reviewer can read and
tests they can run.

| Control                                          | Implemented in                                                           | Proven by                      |
| ------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------ |
| Every request requires a Decionis session        | [middleware.ts](middleware.ts)                                           | `middleware.test.ts`           |
| API returns 401 rather than redirecting to HTML  | [middleware.ts](middleware.ts)                                           | `middleware.test.ts`           |
| Role claims parse defensively; floor is `VIEWER` | [CdiSessionResolver.ts](infra/auth/CdiSessionResolver.ts)                | `CdiSessionResolver.test.ts`   |
| Reviews require `APPROVER` or `ADMIN`            | [OpportunityService.ts](application/opportunities/OpportunityService.ts) | `OpportunityService.test.ts`   |
| Credential never appears in a URL                | [JsonHttpClient.ts](infra/api/JsonHttpClient.ts)                         | `JsonHttpClient.test.ts`       |
| Token never crosses into client-side code        | Server-component boundary                                                | `ServerClientBoundary.test.ts` |
| Upstream responses validated before use          | [domain/](domain/) Zod contracts                                         | `JsonHttpClient.test.ts`       |
| No fixture fallback on live failure              | [CdiRepositoryFactory.ts](infra/repositories/CdiRepositoryFactory.ts)    | `DemoCdiRepository.test.ts`    |
| Errors disclose no internal detail               | [CdiApiErrorMapper.ts](infra/api/CdiApiErrorMapper.ts)                   | `CdiApiErrorMapper.test.ts`    |

A reviewer can run the whole suite in under a minute, with no credentials:

```bash
pnpm install
pnpm test
```

## Things a reviewer can run

```bash
# The full gate CI runs: format, lint, typecheck, tests, production build
pnpm verify

# No known vulnerabilities in the production dependency tree
pnpm audit --prod

# Every production dependency within the approved license set
pnpm licenses:check

# The complete third-party inventory, regenerated from the lockfile
pnpm licenses:list
```

Verifying a release artifact came from this source and not from someone's laptop:

```bash
gh attestation verify decionis-cdi-<version>.tar.gz --repo decionis/cdi
```

## Running it without credentials

The application boots against deterministic fixtures. A reviewer can exercise the entire operator
workflow — including submitting a review — without a Decionis tenant, an account, or a key:

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Demo mode is explicit and visible: the interface carries a `DEMO EVIDENCE` badge, and every review
control is captioned "Records a review only; no downstream limit is changed."

## Fast answers to common questionnaire rows

| Row                                     | Answer                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| Customer data at rest in this component | **None.** No database, no cache, no session store.                                 |
| Telemetry or analytics                  | **None.** No third-party scripts; no outbound request except the Decionis API.     |
| Cookies set by this component           | **None.** Session cookies come from the Decionis identity handoff; CDI reads them. |
| PII in URLs                             | **No.** Account identifiers are opaque references.                                 |
| Secrets in this repository              | **None.** No credential, key, or connector secret is present or required.          |
| Sub-processors introduced by this tier  | **None.**                                                                          |
| Security headers                        | Seven set globally — tabulated in [ThreatModel.md](./ThreatModel.md).              |
| Content-Security-Policy                 | **Not yet set.** Disclosed as the most significant known gap.                      |
| Penetration test report                 | Not yet commissioned.                                                              |
| SOC 2 / ISO 27001                       | Certifications belong to the Decionis platform, not to this repository.            |

The last three are deliberately in this table. A reviewer finds gaps faster than we can hide them,
and a vendor that states its own weak spots is easier to trust on the rest.

## What is out of scope for this repository

Route these to the Decionis platform, not here:

- Policy evaluation and the `customer_ops` policy pack
- Connector credentials and identity resolution
- Execution grants, Decision Dossiers, the audit ledger
- Platform certifications, uptime commitments, and data-residency guarantees

[SECURITY.md](./SECURITY.md) says the same thing to security researchers, so a misrouted report gets
redirected rather than dropped.
