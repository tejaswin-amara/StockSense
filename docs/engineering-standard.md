# Universal Engineering Standard for StockSense

## Operating rules

Inspect the repository before editing; preserve existing conventions and stack; select one default tool per problem; prefer standards before products; verify licenses and security posture; avoid premature distributed infrastructure; and keep tests, telemetry, backups, rollback, and failure paths in every production service. Any deviation is recorded in an ADR or pull request.

## Lifecycle

StockSense uses three loops. The inner loop is specification → scaffold → focused tests → pre-commit/pre-push gates. The middle loop is typecheck → test suites → security → build/container scans → preview/staging. The outer loop is controlled rollout → telemetry/SLO monitoring → backup validation → disaster recovery.

## Resource catalog and selected defaults

| Domain | StockSense default | Alternatives / when to use |
|---|---|---|
| Discovery/governance | awesome, Open Source Guide, Plane, Google Eng Practices | Plane when team complexity warrants it |
| Git/release | Pro Git, Conventional Commits, commitlint, semantic-release | Changesets for a monorepo |
| Hooks/toolchain | Lefthook, mise, cookiecutter | pre-commit for Python-first projects |
| Web scaffold | create-t3-app, bulletproof-react | create-t3-turbo for monorepo; Astro for content-first |
| UI | Tailwind, shadcn/ui, Motion, axe-core, Storybook | GSAP for complex timelines; i18next for localization |
| Backend | Next.js modules, FastAPI or Spring Boot for a separately justified service | Keep the modular monolith first |
| Data | PostgreSQL, Prisma, PgBouncer | Drizzle for edge; SQLAlchemy for Python; DuckDB for local analytics; golang-migrate when framework-neutral |
| Auth/IAM | Better Auth | Spring Security, Keycloak for federation, OpenFGA for ReBAC |
| Jobs | BullMQ + Redis | pg-boss before Redis volume warrants it; Temporal for durable workflows |
| Search/realtime | Meilisearch | Typesense for geo/structured search; Socket.IO or Soketi for realtime |
| Files | MinIO only with AGPL review | Validate MIME, size, malware, authorization, signed URLs, retention, backup |
| API contracts | OpenAPI, Spectral, openapi-typescript | tRPC all-TS; GraphQL client-driven queries; AsyncAPI events; Pact consumer contracts; Buf/gRPC internal RPC; Scalar/Swagger UI docs |
| AI/data | Vercel AI, pgvector | Qdrant at dedicated scale; Langfuse/Phoenix, Promptfoo, NeMo; MLflow/DVC; Airflow or Dagster; dbt and Great Expectations |
| Security | OWASP Cheat Sheets, Gitleaks, CodeQL, Semgrep, Trivy, Syft, Grype, Cosign | TruffleHog deep secret discovery; ZAP DAST; Scorecard supply-chain posture |
| Tests | Vitest, Testcontainers, Schemathesis, Playwright, k6 | pytest/GoogleTest/Unity for other languages; WireMock; Stryker; Cypress; Puppeteer; Midscene/Stagehand/Browser Use/Skyvern when justified |
| Docs | Markdown, Mermaid, lychee | Docusaurus or MkDocs Material for a published docs site |
| Containers/IaC | Docker Compose, OCI, devcontainers, OpenTofu, Caddy | Pulumi; Traefik; Kubernetes/kind/Helm/Argo CD only after escalation |
| Observability | OpenTelemetry Collector, Prometheus, Grafana, Sentry, Umami, Tempo | Jaeger; Loki and Pyroscope only after license/operations review |
| Reliability | pgBackRest, Unleash | Free-for-dev informs hosting evaluation, not production selection |
| References/learning | Medusa, Lago, Tauri, Electron, React Native, Flutter, RealWorld, Spring Petclinic, Cal.com, roadmaps, project-based-learning, Build Your Own X | Study/reference only; do not add unrelated runtime dependencies |
| Agent governance | MCP specification, agent skills, Microsoft Agent Governance Toolkit, no-mistakes | Inspect-first, preserve-stack, incremental verification, zero-bypass, synchronized docs |

## Escalation paths

Deployment: simple service/container → VM/managed container → Kubernetes → GitOps. Architecture: single application → modular monolith → app + worker → separate services → event-driven. Persistence: PostgreSQL → pgvector → Qdrant; jobs: PostgreSQL-backed queue → Redis/BullMQ → Temporal. Move right only after measured scale, reliability, domain, or team requirements.

## License and risk notes

Confirm every dependency before public release. Pay special attention to MinIO and Loki AGPL obligations, OpenTofu MPL-2.0, Sentry deployment terms, and copied reference-project code. Record approval in a dependency inventory.
