# CI/CD Pipeline

## Stage sequence

```text
format/lint (Biome)
 → typecheck (tsc)
 → unit (Vitest)
 → integration (Testcontainers)
 → contract/API (Schemathesis)
 → build
 → security (Gitleaks, Semgrep, Trivy)
 → container build/scan
 → SBOM (Syft)
 → sign (Cosign)
 → staging deploy
 → smoke/E2E (Playwright)
 → production approval/deploy
```

## Branches and releases

Use short-lived branches and pull requests into `main`. Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`) are checked by commitlint. A tagged release produces an immutable image and signed SBOM. Renovate or Dependabot opens dependency updates; security updates are prioritized.

## Environments

- **Local:** Docker Compose dependencies, seeded demo data, no production secrets.
- **CI:** ephemeral PostgreSQL/Redis via Testcontainers; isolated test database.
- **Staging:** production-like configuration, migrations, smoke/E2E, feature flags.
- **Production:** managed PostgreSQL/PgBouncer, Redis, observability, backups, canary where appropriate.

## Migrations and rollback

Migrations are forward-only, reviewed, and run before application code that requires them. Prefer expand/contract changes. Back up before destructive changes. Application rollback must be compatible with the previous schema version; use feature flags for risky cutovers.

## Required repository controls

Protected `main`, required reviews, signed commits where available, CODEOWNERS for schema/security changes, dependency update automation, secret scanning on pre-commit and CI, and no bypass of failed gates.
