# AGENTS.md — StockSense

1. Inspect manifests, lockfiles, CI, lint, test, and deployment files before proposing changes.
2. Detect archetype: web/API (`package.json`, Dockerfile, FastAPI, Spring); systems/embedded (CMake, Zephyr, ESP-IDF); CLI (Go/Cargo console script); library (exports/build backend); data/ML (dbt, Dagster, DVC).
3. Preserve the current stack. Do not replace framework, ORM, auth, package manager, or deployment model silently.
4. Use the documented defaults only when the repository has no existing convention.
5. Make small changes, run focused tests after each logical change, then run the full validation gate.
6. Never bypass lint, typecheck, tests, security scans, migration review, or branch protections.
7. Treat stock mutation as high-risk: use transactions, row locks, idempotency, and ledger append tests.
8. Keep Markdown docs, ADRs, API contracts, runbooks, and diagrams synchronized with code.
9. Do not expose secrets, OTPs, personal data, or internal management URLs in logs or artifacts.
10. Summarize assumptions, files changed, validation run, and any deferred risk in the pull request.
