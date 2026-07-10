# Decionis CDI

**Governed customer expansion for regulated fintech operations.**

CDI is the customer-facing operational control center for Adaptive Customer Decision Intelligence.
It correlates account evidence, surfaces friction and expansion opportunities, and forwards every
review or action to the existing Decionis execution control plane.

CDI does **not** own policy evaluation, connector secrets, execution grants, or Decision Dossiers.
Those remain authoritative in the Decionis platform.

## Local quickstart

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Development defaults to deterministic demo data. Open <http://localhost:3000>.

## Live mode

Set:

```dotenv
CDI_DATA_MODE=live
DECIONIS_API_BASE_URL=https://api.decionis.com
```

Live mode expects the Decionis identity handoff cookies documented in `.env.example`, or an
`Authorization: Bearer` token and `X-Decionis-Org-Id` header for BFF requests. No API credential is
sent to browser code.

The expected core endpoints are:

- `GET /v1/cdi/portfolio`
- `GET /v1/cdi/accounts/:accountId`
- `GET /v1/cdi/opportunities`
- `POST /v1/cdi/opportunities/:opportunityId/reviews`

## Verification

```bash
pnpm verify
```

## Architectural rules

- Evidence may adapt; policy authority stays deterministic.
- Demo mode is explicit. A live API failure never falls back to fixtures.
- Review actions are role-gated and forwarded to Decionis.
- Framework-required files (`page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`) keep Next.js
  naming; feature and domain files use PascalCase.
- See [Architecture.md](./Architecture.md) for boundaries and the directory map.
