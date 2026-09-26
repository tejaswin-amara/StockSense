# StockSense Documentation Pack

StockSense is a modular inventory management system for authenticated inventory managers and warehouse staff. This pack turns the unified engineering specification, PDF brief, and Excalidraw mock-up into implementation-ready project documents.

## Documents

- [Product Requirements](docs/product-requirements.md) — scope, personas, workflows, KPIs, and acceptance criteria.
- [System Architecture](docs/architecture.md) — modular-monolith design, boundaries, deployment, and observability.
- [Data Model](docs/data-model.md) — PostgreSQL/Prisma entities, invariants, indexes, and ledger rules.
- [API Contract](docs/api-contract.md) — REST resources, lifecycle transitions, errors, idempotency, and authorization.
- [QA and Security Plan](docs/qa-security.md) — test pyramid, security gates, threat controls, and release criteria.
- [CI/CD Pipeline](docs/ci-cd.md) — quality gates, supply-chain controls, environments, and deployment flow.
- [Operations Guide](docs/operations.md) — SLOs, dashboards, alerts, backup/PITR, and escalation.
- [Runbooks](docs/runbooks/) — incident response, rollback, restore, dependency outage, credential rotation, and disaster recovery.
- [Architecture Decision Records](docs/adr/) — initial decisions and consequences.
- [Prisma Schema](schemas/schema.prisma) — source schema aligned to the data model.
- [Contribution Guide](CONTRIBUTING.md) — Git, commits, code review, and documentation rules.

## Recommended implementation baseline

Next.js App Router + TypeScript, pnpm, Biome, Tailwind/shadcn, React Hook Form + Zod, TanStack Query, PostgreSQL + Prisma + PgBouncer, Better Auth, BullMQ + Redis, Meilisearch, Vitest, Testcontainers, Schemathesis, Playwright, k6, GitHub Actions, Gitleaks, Semgrep, CodeQL, Trivy, Syft, Cosign, OpenTelemetry, Prometheus, Grafana, Sentry, and pgBackRest.

## Assumptions

- Status: implementation baseline; review decisions at project kickoff.
- Default architecture: modular monolith. Split services only after measured need.
- Dates are stored in UTC and rendered in the user's configured timezone.
- Quantities are non-negative integers in the baseline; decimal quantities require a reviewed schema change.
- The supplied mock-up is the visual reference for dashboard, stock, warehouse/location, operations, and move-history screens.
