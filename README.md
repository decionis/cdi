# Decionis CDI

**Governed customer expansion for regulated fintech operations.**

CDI is the operational control center for Adaptive Customer Decision Intelligence. It gives customer
operations, risk, and revenue teams a single reviewable surface over their account portfolio: it
correlates account evidence, surfaces friction and expansion opportunities, and forwards every
operator review to the Decionis execution control plane — where the authoritative decision is made,
recorded, and executed.

The problem it solves: in regulated fintech, the people closest to the customer can see that an
account is ready for a higher processing limit or is about to churn, but they cannot act on it
without an auditable, policy-bound path. CDI is that path. Every action an operator takes here
becomes a reviewed, attributable event upstream — never an ad-hoc change made in a spreadsheet.

## What CDI is not

This boundary is the most important thing to understand before contributing.

CDI does **not** own policy evaluation, connector secrets, execution grants, or Decision Dossiers.
Those remain authoritative in the Decionis platform. CDI is a presentation and orchestration layer:

| CDI owns                               | Decionis platform owns                                |
| -------------------------------------- | ----------------------------------------------------- |
| The operator UI and review workflow    | Policy evaluation and the `customer_ops` policy pack  |
| Server-side orchestration (the BFF)    | Connector credentials and identity resolution         |
| Typed, runtime-validated API contracts | Execution grants, Decision Dossiers, the audit ledger |
| Formatting and presentation policy     | The authoritative record of every review              |

An operator can accept a review in CDI. That acceptance cannot, by itself, change a processing limit
or a policy. CDI forwards the review; Decionis decides, executes, and returns the resulting state and
a dossier reference.

```text
Browser
  -> CDI Next.js server / BFF          <- this repository
    -> Decionis /v1/cdi APIs
      -> SignalFed, connectors, identity resolution
      -> customer_ops policy pack
      -> execution grants, dossiers, ledger
```

## Quickstart

Requires **Node >= 20** and **pnpm 9**. No Decionis credentials are needed — the app boots against
deterministic demo fixtures.

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

### What you get in demo mode

`CDI_DATA_MODE=demo` (the default outside production) serves every screen from
`infra/demo/DemoCdiData.ts` via `DemoCdiRepository`. You are signed in as a fixture operator with
`ADMIN` and `APPROVER` roles in the `demo-fintech` organization, so the full review flow is
exercisable end to end:

- **Portfolio dashboard** (`/`) — account health, evidence coverage, and the summary counters that
  drive triage.
- **Opportunity queue** — friction interventions, KYC/KYB escalations, processing-limit reviews, and
  expansion outreach, each with its rationale, confidence, and linked evidence.
- **Account detail** (`/accounts/[id]`) — evidence signals, connection health, applicable policy, and
  the decision timeline.

Reviews submitted in demo mode return a deterministic result. Nothing is persisted and no downstream
action is executed.

## Configuration

All configuration is parsed and validated once, at startup, by `CdiRuntimeConfig.fromEnvironment()`.
Invalid or missing required values fail fast rather than degrading at request time.

| Variable                           | Required         | Default                           | Purpose                                                      |
| ---------------------------------- | ---------------- | --------------------------------- | ------------------------------------------------------------ |
| `CDI_DATA_MODE`                    | no               | `live` in production, else `demo` | Selects `DemoCdiRepository` or `DecionisCdiRepository`.      |
| `DECIONIS_API_BASE_URL`            | **in live mode** | —                                 | Decionis API origin. Startup throws in live mode if unset.   |
| `DECIONIS_CDI_SERVICE_TOKEN`       | no               | —                                 | Server-to-server fallback credential. Prefer a user session. |
| `CDI_ACCESS_TOKEN_COOKIE`          | no               | `decionis_access_token`           | Cookie carrying the Decionis access token.                   |
| `CDI_ORG_ID_COOKIE`                | no               | `decionis_org_id`                 | Cookie carrying the organization scope.                      |
| `NEXT_PUBLIC_DECIONIS_SIGN_IN_URL` | no               | `https://decionis.com/sign-in`    | External identity handoff target used by `/sign-in`.         |

Two further cookies are read opportunistically in live mode and are **not** required:
`decionis_display_name` (URL-encoded, for the app shell) and `decionis_roles` (a comma-separated
subset of `VIEWER,OPERATOR,APPROVER,ADMIN`; anything unrecognized is dropped, and an empty result
falls back to `VIEWER`).

No API credential is ever exposed to browser code. The upstream client is server-only, and its
request timeout is currently fixed at 8s in `CdiRuntimeConfig`.

## Live mode

```dotenv
CDI_DATA_MODE=live
DECIONIS_API_BASE_URL=https://api.decionis.com
```

In live mode `middleware.ts` requires a Decionis session on every path except `/api/health` and
`/sign-in`. Page requests without one are redirected to `/sign-in?returnTo=…`; API requests receive
`401 {"error":"UNAUTHORIZED"}`. BFF callers may instead present an `Authorization: Bearer` token with
an `X-Decionis-Org-Id` header.

A live API failure surfaces as an error. It **never** falls back to demo fixtures — silently showing
fabricated data to an operator making a regulated decision is treated as a defect, not a resilience
feature.

### Routes this app exposes

| Route                                | Method | Notes                                       |
| ------------------------------------ | ------ | ------------------------------------------- |
| `/api/cdi/portfolio`                 | GET    | Portfolio snapshot for the session's org.   |
| `/api/cdi/accounts/[id]`             | GET    | `404` when the account is unknown.          |
| `/api/cdi/opportunities`             | GET    | Opportunity queue.                          |
| `/api/cdi/opportunities/[id]/review` | POST   | Requires `APPROVER` or `ADMIN`, else `403`. |
| `/api/health`                        | GET    | Unauthenticated liveness probe.             |

### Upstream endpoints it expects

- `GET /v1/cdi/portfolio`
- `GET /v1/cdi/accounts/:accountId`
- `GET /v1/cdi/opportunities`
- `POST /v1/cdi/opportunities/:opportunityId/reviews`

Every upstream response is parsed through a Zod contract in `domain/` before it is allowed into the
application layer, so schema drift upstream fails loudly at the boundary instead of rendering as a
subtly wrong number on a dashboard.

## Architecture

Four layers, one direction of dependency: `app` → `application` → `domain`, with `infra` supplying
implementations through a composition root and `presentation` holding formatting policy only.

| Layer           | Responsibility                                                     |
| --------------- | ------------------------------------------------------------------ |
| `app/`          | Next.js routes, the BFF, and framework entrypoints.                |
| `application/`  | Use-case services and permission checks (`OpportunityService`, …). |
| `domain/`       | Typed, runtime-validated CDI contracts. No I/O.                    |
| `infra/`        | Gateways, repositories, config, errors, demo data, composition.    |
| `presentation/` | Formatting and presentation policy.                                |

Swapping demo for live is a single decision in `CdiRepositoryFactory` behind the `CdiRepository`
interface — the application and UI layers cannot tell the difference. See
[Architecture.md](./Architecture.md) for the full boundary and directory map.

## Development

```bash
pnpm dev              # Next.js dev server
pnpm test             # Vitest
pnpm test:watch       # Vitest in watch mode
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm format:fix       # Prettier write
pnpm verify           # format + lint + typecheck + test + build
pnpm licenses:check   # Fail on a dependency outside the approved license policy
pnpm licenses:list    # Production dependency licenses
```

`pnpm verify` is the gate — run it before opening a pull request.

CI runs it on Node 20 and 22 (`.github/workflows/verify.yml`), and separately runs `pnpm audit --prod`
and `pnpm licenses:check` (`.github/workflows/audit.yml`), the latter two also on a weekly schedule so
an advisory published against an unchanged tree still surfaces. All three must pass to merge.

### Dependency policy

Production dependencies must carry a license in the approved set enforced by
[CheckLicensePolicy.mjs](scripts/CheckLicensePolicy.mjs). Adding a dependency under any other license
requires an explicit, package-scoped exception in that file and a recorded rationale in
[ThirdPartyLicenses.md](./ThirdPartyLicenses.md).

`package.json` carries a `pnpm.overrides` block pinning `postcss`, `nanoid`, and `sharp` above known
vulnerable ranges. These are forward pins to patched releases, not version freezes — remove each once
the upstream `next` range resolves past it on its own.

### Conventions

- **Feature and domain files use PascalCase** (`AccountService.ts`, `CustomerOpportunity.ts`).
  Framework-required files keep Next.js naming (`page.tsx`, `layout.tsx`, `route.ts`,
  `middleware.ts`), as do directory segments.
- **Classes and interfaces over loose utility functions.** Each module gets one reason to change.
- **camelCase** for variables, properties, and methods.
- Full rules in [coding.rule.md](./coding.rule.md).

### Non-negotiable rules

1. Evidence may adapt; policy authority stays deterministic.
2. Demo mode is explicit. A live API failure never falls back to fixtures.
3. Review actions are role-gated in `application/` and forwarded to Decionis — the UI is not the
   enforcement point.
4. No credential, token, or connector secret reaches client-side code.

## Security

This repository holds no secrets and no policy logic, which is what makes it safe to develop against
in the open.

The trust boundary is enforced in four files, and each is covered by tests you can run:

| Enforcement                                             | Code                                                                     | Tests                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------- |
| Session gating, 401-vs-redirect, health-probe exemption | [middleware.ts](middleware.ts)                                           | `middleware.test.ts`         |
| Role parsing and the `VIEWER` privilege floor           | [CdiSessionResolver.ts](infra/auth/CdiSessionResolver.ts)                | `CdiSessionResolver.test.ts` |
| Credential handling and boundary schema validation      | [JsonHttpClient.ts](infra/api/JsonHttpClient.ts)                         | `JsonHttpClient.test.ts`     |
| Role-gated review forwarding                            | [OpportunityService.ts](application/opportunities/OpportunityService.ts) | `OpportunityService.test.ts` |

Four properties the tests assert directly: the access token never appears in a request URL, only in
the `Authorization` header; no client component ever receives the session, so the token is never
serialized into a page payload; an unrecognized or wrong-case role claim resolves to `VIEWER` rather
than to an empty role set; and an unhandled error maps to a generic 500 that leaks no internal detail.

[ThreatModel.md](./ThreatModel.md) sets out the assets, trust boundaries, seven named threats with the
code and test backing each mitigation, the security headers this app sets — and, deliberately, the
gaps we have accepted rather than fixed.

**Reporting a vulnerability:** do not open a public issue. See [SECURITY.md](./SECURITY.md) for the
private disclosure process, scope, and response targets.

## Contributing

Run `pnpm verify` before opening a pull request. Follow the conventions above and in
[coding.rule.md](./coding.rule.md), and read the trust boundary before proposing anything that moves
decision authority into this repository — that is the one change the project will not accept.

Contributions are accepted under the Apache-2.0 license, per section 5 of the
[LICENSE](./LICENSE). Contributor guidelines, a code of conduct, DCO sign-off enforcement, and CI are
being added; see [OpenSource.md](./OpenSource.md) for what is landing and in what order.

## License

Licensed under the **Apache License, Version 2.0** — see [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
Copyright 2026 Decionis, Inc.

Apache-2.0 is the default license across Decionis projects: permissive, with an express patent grant.

Third-party components and their licenses are inventoried in
[ThirdPartyLicenses.md](./ThirdPartyLicenses.md). No dependency imposes a reciprocal obligation on
this codebase.

`package.json` is marked `"private": true`. That prevents accidental publication to npm — this is a
deployable application, not a library — and does not restrict use of the source under Apache-2.0.

## Project status

Version 0.1.0, pre-1.0 and under active development. Contracts in `domain/` may change without a
deprecation period until the first tagged release. [OpenSource.md](./OpenSource.md) tracks the
remaining work toward a public launch.
