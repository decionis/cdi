<!--
If this fixes a security vulnerability, do not open a public pull request.
See SECURITY.md for the private disclosure process.
-->

## What and why

<!-- The diff shows what changed. Explain why it needed to change. -->

Closes #

## Checks

- [ ] `pnpm verify` passes locally
- [ ] Commits are signed off (`git commit -s`) — see [DCO](https://developercertificate.org/)

## Trust boundary

<!--
CDI renders evidence and forwards reviews; the Decionis platform owns policy, credentials,
execution, and the audit record. See CONTRIBUTING.md and ThreatModel.md.
-->

- [ ] This change does **not** evaluate policy locally, persist customer data in this tier, add a
      fixture fallback on live API failure, or treat CDI's own role check as the security control.

If it touches `middleware.ts`, `infra/auth/`, `infra/api/`, `infra/config/`, `domain/`, or
`application/`:

- [ ] Test coverage added or updated for the changed behaviour
- [ ] I checked the tests would actually fail if the behaviour regressed

## Dependencies

If `package.json` or `pnpm-lock.yaml` changed:

- [ ] Lockfile committed (CI installs with `--frozen-lockfile`)
- [ ] `pnpm audit --prod` clean
- [ ] `pnpm licenses:check` passes; any new exception is recorded in `ThirdPartyLicenses.md`
