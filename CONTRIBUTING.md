# Contributing to StockSense

## Before coding

Read `README.md`, `AGENTS.md`, the relevant ADR, and the target module conventions. Confirm the change is in scope and identify API, schema, telemetry, security, and runbook impacts.

## Workflow

Create a short-lived branch from `main`. Use Conventional Commits such as `feat: add receipt validation`, `fix: prevent duplicate delivery`, or `docs: update restore runbook`. Keep commits focused and rebase before merge when required by repository policy.

## Pull requests

Describe the problem, solution, alternatives, migration impact, test evidence, observability changes, security considerations, and rollback plan. Link the requirement or issue. Include screenshots for UI changes and update the API/schema/docs together.

## Required checks

Run format/lint, typecheck, unit tests, integration tests, API contract checks, build, and security scans. Changes affecting stock mutations require concurrency, rollback, idempotency, and ledger assertions. Never disable a gate to obtain a green build.

## Review standard

Reviewers check correctness, authorization, data integrity, accessibility, performance, operational safety, test quality, and documentation synchronization. Use CODEOWNERS for schema, security, and deployment changes when configured.

## License

The project license and third-party dependency licenses must be reviewed before public release. Do not copy reference-project code without preserving its license obligations.
