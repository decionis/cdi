# CDI Architecture

## Trust boundary

```text
Browser
  -> CDI Next.js server / BFF
    -> Decionis /v1/cdi APIs
      -> SignalFed, connectors, identity resolution
      -> customer_ops policy pack
      -> execution grants, dossiers, ledger
```

The CDI repository owns presentation and server-side orchestration only. The Decionis platform owns
all authoritative customer signals, policy decisions, credentials, and action execution.

## Directory structure

```text
app/                          Next.js routes and framework entrypoints
  accounts/[accountId]/       Account evidence view
  api/cdi/                    Browser-facing CDI BFF
  sign-in/                    Decionis identity handoff
Application/                  Use-case services and permission checks
  Accounts/
  Dashboard/
  Opportunities/
Components/                   Feature-grouped React presentation
  Account/
  Common/
  Dashboard/
  Layout/
Domain/                       Typed, runtime-validated CDI contracts
  Accounts/
  Auth/
  Common/
  Evidence/
  Opportunities/
  Portfolio/
Infrastructure/               External systems and implementation details
  Api/
  Auth/
  Composition/
  Config/
  Demo/
  Errors/
  Repositories/
Presentation/                 Formatting and presentation policies
  Format/
```

## Runtime modes

### Demo

Deterministic fixtures are returned by `DemoCdiRepository`. Mutations return a deterministic review
result and do not persist or execute a downstream action.

### Live

`DecionisCdiRepository` uses the server-only `DecionisCdiGateway`. Responses are parsed through Zod
contracts before entering the application layer. Authentication and organization scope are forwarded
server-side.

## Decision safety

The external application may accept an operator review. It cannot directly change a processing limit
or policy. The core CDI API must create or update the authoritative review, invoke the Decionis policy
and execution boundary, and return the resulting state and dossier reference.
