# Resource and License Inventory

This inventory turns the universal resource catalog into an adoption record. Before adding a dependency, record the owner, purpose, version, license, data handled, production scope, security review, and removal/rollback plan.

| Resource | Role | Adoption state | License review | Owner |
|---|---|---|---|---|
| PostgreSQL / Prisma / PgBouncer | System of record and pooling | Default | Pending project review | Backend |
| Better Auth | Sessions and identity | Default | Pending project review | Identity |
| BullMQ / Redis | Reorder alerts and reports | Default | Pending project review | Platform |
| Meilisearch | SKU/contact search | Optional | Pending project review | Catalog |
| OpenTelemetry / Prometheus / Grafana / Sentry | Telemetry and errors | Default | Pending project review | SRE |
| pgBackRest | Backup and PITR | Default | Pending project review | DBA/SRE |
| MinIO / Loki | Optional storage/logging | Not selected | AGPL review required | Platform |
| OpenTofu / Caddy | IaC and edge | Default | Pending project review | Platform |
| Playwright / Vitest / Testcontainers / Schemathesis / k6 | Verification | Default | Pending project review | QA |
| Gitleaks / CodeQL / Semgrep / Trivy / Syft / Grype / Cosign | Security and supply chain | Default | Pending project review | Security |

The resource catalog in `engineering-standard.md` records alternatives and selection rules. Reference repositories such as Medusa, Lago, RealWorld, Spring Petclinic, Cal.com, and educational roadmaps are study material only unless separately approved.
