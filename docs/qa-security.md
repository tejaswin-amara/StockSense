# QA and Security Plan

## 1. Test layers

`Unit → Integration → Contract → E2E → Performance/Security`

- Unit: lifecycle rules, KPI formulas, reference generation, availability, authorization policies.
- Integration: PostgreSQL transactions, row locking, rollback, Redis/BullMQ, search indexing.
- Contract: OpenAPI validation, Schemathesis property/fuzz tests, idempotency behavior.
- E2E: Playwright on Chromium, Firefox, and WebKit for sign-in, receipt, delivery, transfer, adjustment, dashboard filters, and profile flows.
- Performance: k6 baselines for dashboard reads, search, and concurrent validations.

## 2. Critical scenarios

1. Two concurrent deliveries cannot oversell the same stock.
2. A failed multi-line validation rolls back every line and ledger row.
3. Replaying a validation request does not duplicate stock impact.
4. A Waiting delivery becomes Ready only after availability is sufficient.
5. Warehouse scope prevents cross-facility data access.
6. A canceled or Done document rejects further mutation.
7. OTP expires, is single-use, and is never logged.

## 3. Security controls

- Gitleaks and TruffleHog secret scanning.
- CodeQL and Semgrep SAST.
- Trivy dependency, image, and IaC scanning.
- Syft SBOM, Grype vulnerability review, Cosign artifact signing.
- Secure headers, CSRF protection for cookie-authenticated mutations, input/output validation, parameterized ORM queries, rate limiting, and audit logging.
- Threat model assets: stock integrity, credentials, personal data, operational availability, and ledger history. Key threats: IDOR, privilege escalation, replay, race conditions, injection, enumeration, and supply-chain compromise.

## 4. Release gates

No merge when formatting, typecheck, tests, contract checks, security scans, or required review fail. High/critical exploitable vulnerabilities, leaked secrets, broken migrations, or stock-integrity test failures block release.

## 5. Definition of done

Feature code, tests, OpenAPI/schema updates, user-facing documentation, runbook impact assessment, telemetry, migration rollback plan, and reviewer approval are complete.
