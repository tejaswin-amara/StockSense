# Jules Prompt — Build StockSense End to End

You are Jules by Google acting as the senior product engineer, architect, UI engineer, backend engineer, QA engineer, security engineer, and DevOps engineer for this repository.

Build **StockSense**, a production-ready modular Inventory Management System from end to end. Do not stop at scaffolding, mock screens, or a partial prototype. Inspect the repository first, preserve any existing conventions, and implement, test, document, and validate the complete product.

## Source of truth

Before editing, read and use these project documents in order:

1. `README.md`
2. `AGENTS.md`
3. `docs/source-materials.md`
4. `docs/product-requirements.md`
5. `docs/architecture.md`
6. `docs/data-model.md`
7. `docs/api-contract.md`
8. `docs/qa-security.md`
9. `docs/ci-cd.md`
10. `docs/operations.md`
11. `docs/engineering-standard.md`
12. `docs/adr/`
13. `schemas/schema.prisma`

The supplied PDF and Excalidraw mock-up are the visual/product references for the dashboard, stock availability, warehouse/location settings, receipts, delivery orders, move history, and profile navigation. If they are available in the repository or task attachments, inspect them before implementing UI.

## First step: repository inspection

Detect the project archetype from manifests and preserve the current stack. Inspect `package.json`, lockfiles, TypeScript configuration, framework configuration, database configuration, test configuration, CI files, Docker files, environment examples, and existing source conventions. Do not silently replace an existing framework, ORM, authentication system, package manager, or deployment architecture.

If the repository is empty, use the documented baseline:

- Next.js App Router + TypeScript
- pnpm
- Biome
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- TanStack Query
- PostgreSQL + Prisma + PgBouncer
- Better Auth or the repository’s existing secure auth framework
- BullMQ + Redis for asynchronous alerts/reports
- Meilisearch only when search needs exceed bounded PostgreSQL search
- Vitest, Testcontainers, Schemathesis, Playwright, and k6
- GitHub Actions with Gitleaks, Semgrep, CodeQL, Trivy, Syft, Grype, and Cosign
- OpenTelemetry, Prometheus, Grafana, Sentry, and pgBackRest

## Product to build

### Users and authentication

Implement Inventory Manager and Warehouse Staff roles. Provide sign-up, sign-in, secure sessions, logout, profile, and OTP-based password recovery.

Sign-up rules:

- Login ID is unique, alphanumeric, and 6–12 characters.
- Email is unique and valid.
- Password is at least 8 characters and contains lowercase, uppercase, and special characters.
- Password confirmation matches exactly.

Failed sign-in must show exactly: `Invalid Login Id or Password`.

Password reset must use a time-bound, single-use OTP, avoid account enumeration, rate-limit attempts, and never log the OTP.

### Navigation and UI

Create a polished, accessible responsive application with persistent navigation for:

- Dashboard
- Products / Stock
- Operations: Receipts, Delivery Orders, Internal Transfers, Inventory Adjustments
- Move History
- Settings: Warehouses and Locations
- Profile: My Profile and Logout

Use the supplied mock-up as the visual direction. Implement loading, empty, error, success, validation, confirmation, and permission-denied states. Target WCAG 2.1 AA with keyboard navigation, semantic labels, visible focus, sufficient contrast, and screen-reader-friendly tables/forms.

### Dashboard

Display:

- Total Products in Stock
- Low Stock / Out of Stock Items
- Pending Receipts
- Pending Deliveries
- Scheduled Internal Transfers
- Receipt and delivery breakdowns for Late, Waiting, and Operations

Filters must work server-side and client-side as appropriate for:

- Document type: Receipt, Delivery, Internal Transfer, Adjustment
- Status: Draft, Waiting, Ready, Done, Canceled
- Warehouse or location
- Product category

Definitions:

- Late: scheduled date is before today and status is not Done.
- Operations: active scheduled documents with scheduled date today or later.
- Waiting: outgoing work blocked by insufficient Free to Use stock.

### Catalog and stock

Implement product create/update/list/detail with:

- Name
- SKU/code
- Category
- Unit of Measure
- Per-unit cost
- Low-stock/reorder threshold
- Optional initial stock

Show availability by location with Product, Per Unit Cost, On Hand, Reserved, and Free to Use. Free to Use is `onHand - reserved`. Provide SKU/product/contact search and smart filters. Do not allow untracked stock edits that bypass the ledger; administrative corrections must use the adjustment workflow.

### Receipts

Implement list, detail, create, edit-before-validation, search, and Kanban status views.

Lifecycle: `Draft → Ready → Done`; allow cancellation before validation.

Receipt fields include reference, vendor/contact, scheduled date, responsible user, and product lines. `TODO` moves Draft to Ready. `Validate` atomically increases stock and appends one green inbound ledger move per product line. A Done receipt is immutable and printable.

### Delivery orders

Implement list, detail, create, edit-before-validation, search, and Kanban status views.

Lifecycle: `Draft → Waiting or Ready → Done`; allow cancellation before validation.

Delivery fields include reference, customer/contact, delivery address, scheduled date, operation type, responsible user, and product lines. If requested quantity exceeds Free to Use, automatically set Waiting, notify the user, and highlight the blocked line in red. Validate only when all lines are available; atomically decrement stock and append one red outbound ledger move per line.

### Internal transfers

Move stock between locations or warehouses, for example Main Store → Production Rack or Rack A → Rack B. Lock both source and destination stock rows, change location balances, preserve total company quantity, and append an internal ledger move.

### Stock adjustments

Select product and location, show recorded stock, accept physical count, compute `delta = counted - recorded`, update the balance, and append an adjustment ledger move. Require a reason and responsible user. Never edit historical ledger rows.

### Move History / immutable ledger

Create a chronological ledger with:

- Reference
- Date
- Product
- From Location
- To Location
- Quantity
- Contact
- Status
- Direction

Split multi-product operations into independent rows. Render inbound rows green and outbound rows red. Validated moves are append-only and cannot be deleted or modified.

### Warehouses and locations

Implement multi-warehouse support, unique warehouse codes, addresses, and locations/racks. References follow `<warehouse>/<operation>/<id>`, such as `WH/IN/0001`, `WH/OUT/0001`, `WH/INT/0001`, and `WH/ADJ/0001`. Reference generation must be atomic and collision-safe.

## Data and backend requirements

Use `schemas/schema.prisma` as the starting schema and improve it only when required by implementation. Preserve the entities User, Warehouse, Location, Product, StockLevel, Operation, OperationLine, and StockMove, plus any carefully justified supporting entities such as sessions, OTPs, idempotency keys, audit events, or outbox events.

Enforce these invariants:

- `onHand >= 0`, `reserved >= 0`, and `reserved <= onHand` under the baseline policy.
- Validated operations and StockMove rows are immutable.
- StockLevel and StockMove changes occur in one database transaction.
- A delivery cannot oversell stock under concurrent requests.
- Validation endpoints are idempotent using `Idempotency-Key`.
- Replaying a successful request returns the original result without duplicating stock impact.
- Failed multi-line validation rolls back every line and ledger row.
- Authorization is checked server-side on every operational endpoint.

Implement migrations, seed data, indexes, pagination, deterministic ordering, transaction boundaries, row locks, structured errors, correlation/request IDs, and safe environment configuration.

## API requirements

Implement `/api/v1` following `docs/api-contract.md`. Publish an OpenAPI 3 contract and validate it with Spectral. Generate client types if the stack supports it. Use the documented error codes, lifecycle transitions, cursor pagination, and idempotency behavior.

## Public APIs repository: use only if appropriate

Reference: https://github.com/public-apis/public-apis

The repository is a community-curated catalog of public APIs and is MIT-licensed. It is suitable as an **optional developer/admin integration catalog or seed/reference dataset**, but it is not needed for core inventory accounting.

Use it only under these rules:

1. Do not make StockSense stock calculations, authentication, ledger integrity, dashboard KPIs, or core workflows depend on any public API.
2. Do not call arbitrary third-party APIs from the browser or production without explicit provider review, authentication, rate-limit handling, privacy review, timeout/retry policy, and a documented owner.
3. Prefer a pinned, reviewed snapshot or a small extracted catalog of relevant APIs rather than adding the entire upstream repository as a runtime dependency.
4. Preserve MIT attribution and record the upstream commit/date in `docs/resource-inventory.md` or a new `docs/integrations/public-apis.md` file.
5. If appropriate, add an admin-only **Integration Catalog** under Settings that lets users search/filter catalog entries by category, auth type, HTTPS/CORS support, and description. This catalog is informational and must not be presented as a verified endorsement.
6. If the repository is not appropriate for the current implementation, do not force it into the product. Document the decision in an ADR or `docs/integrations/public-apis.md` and continue with the core StockSense build.

## Quality and security gates

Implement and run:

- Biome formatting/linting
- TypeScript typecheck
- Unit tests with Vitest
- Integration tests with Testcontainers and PostgreSQL
- Contract/property tests with Schemathesis
- Playwright E2E tests on Chromium, Firefox, and WebKit
- k6 baseline tests for dashboard reads and concurrent stock validations
- Gitleaks secret scan
- Semgrep and CodeQL static analysis
- Trivy dependency/image/IaC scan
- Syft SBOM and Grype scan
- Cosign signing where release infrastructure supports it
- Accessibility checks with axe-core
- Markdown/link/schema validation

At minimum, test:

1. Valid and invalid sign-up/sign-in/password reset.
2. Role and facility authorization boundaries.
3. Receipt validation increases stock and writes an inbound move.
4. Delivery shortage becomes Waiting without changing stock.
5. Delivery validation decrements stock and writes an outbound move.
6. Concurrent deliveries cannot oversell.
7. Internal transfer preserves company total and changes locations.
8. Adjustment from 100 to 97 produces a -3 correction.
9. Duplicate SKU, email, login ID, and reference are rejected.
10. Replayed validation is idempotent.
11. Failed multi-line transactions roll back completely.
12. Done documents and ledger rows are immutable.
13. Dashboard filters and KPI definitions are correct.
14. Keyboard and screen-reader workflows work on core screens.

## Delivery and operations

Provide local development with reproducible dependencies, environment examples, seed data, and clear startup commands. Keep the architecture as a modular monolith unless measured requirements justify adding a worker or separate service.

Add or update:

- Docker/devcontainer setup when appropriate
- GitHub Actions quality workflow
- OpenTofu/IaC only for infrastructure that is actually needed
- OpenTelemetry instrumentation
- Prometheus/Grafana dashboards and actionable alerts
- Sentry error tracking
- pgBackRest backup/PITR configuration guidance
- Runbooks for incident response, rollback, restore, dependency outage, credential rotation, and disaster recovery
- Feature flags for risky migrations or progressive rollout

## Definition of done

The task is complete only when:

- The app runs locally from documented commands.
- Core user journeys work against a real PostgreSQL database.
- The UI is responsive and accessible.
- Stock mutations are transactional, concurrent-safe, idempotent, and ledger-backed.
- The API contract, schema, migrations, tests, docs, runbooks, and telemetry are synchronized.
- CI quality and security gates run successfully or have a clearly documented environment limitation.
- No secrets or unreviewed third-party runtime calls are introduced.
- The Public APIs decision is documented, whether the optional catalog is implemented or intentionally omitted.
- The final response includes changed files, setup instructions, test commands/results, migration notes, security considerations, known limitations, and next steps.

Work incrementally, verify after each logical change, and never disable a validation or security gate to force a green build.
