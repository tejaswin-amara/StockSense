# Runbook: Incident Response

## Trigger
Use for elevated errors, unavailable dependencies, suspected stock-integrity issues, security events, or SLO breach.

## Procedure

1. Page on-call, create an incident record, assign an incident commander, and capture start time.
2. Confirm scope using Grafana/Sentry: affected routes, warehouses, operations, users, and data integrity.
3. If ledger integrity is uncertain, enable read-only mode for stock-changing commands.
4. Preserve evidence: request IDs, deploy SHA, logs, traces, database transaction IDs, and screenshots. Do not copy secrets or OTPs.
5. Mitigate with rollback, feature flag, dependency isolation, or capacity change. Do not edit ledger rows manually.
6. Validate recovery with smoke tests and a sample read-only reconciliation.
7. Communicate impact and next update time to stakeholders.
8. Close only after monitoring is stable; complete a blameless review with root cause and corrective actions.

## Exit criteria
No unresolved stock mismatch, error rate back to baseline, backups healthy, and a follow-up owner/date assigned.
