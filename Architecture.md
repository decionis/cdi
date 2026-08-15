# Steward Architecture

## Trust boundary

```text
Browser
  -> Steward Next.js server / BFF
    -> Decionis /v1/cdi APIs
      -> SignalFed, connectors, identity resolution
      -> customer_ops policy pack
      -> execution grants, dossiers, ledger
```

The Steward repository owns presentation and server-side orchestration only. The Decionis platform owns
all authoritative customer signals, policy decisions, credentials, and action execution.

## Directory structure

```text
app/                          Next.js routes and framework entrypoints
  accounts/[id]/              Account evidence view
  api/steward/                    Browser-facing Steward BFF
  sign-in/                    Decionis identity handoff
application/                  Use-case services and permission checks
  accounts/
  dashboard/
  opportunities/
components/                   Feature-grouped React presentation
  account/
  common/
  dashboard/
  layout/
domain/                       Typed, runtime-validated Steward contracts
  accounts/
  auth/
  common/
  evidence/
  opportunities/
  portfolio/
infra/                        External systems and implementation details
  api/
  auth/
  composition/
  config/
  demo/
  errors/
  repositories/
presentation/                 Formatting and presentation policies
  format/
```

## Runtime modes

### Demo

Deterministic fixtures are returned by `DemoStewardRepository`. Mutations return a deterministic review
result and do not persist or execute a downstream action.

### Live

`DecionisStewardRepository` uses the server-only `DecionisStewardGateway`. Responses are parsed through Zod
contracts before entering the application layer. Authentication and organization scope are forwarded
server-side.

## Decision safety

The external application may accept an operator review. It cannot directly change a processing limit
or policy. The core Steward API must create or update the authoritative review, invoke the Decionis policy
and execution boundary, and return the resulting state and dossier reference.
