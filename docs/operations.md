# Operations and Reliability Guide

## Service objectives

Initial targets: 99.5% monthly availability; p95 read API <500 ms; p95 stock validation <1 s; successful ledger append rate 100% for accepted validations; RPO ≤15 minutes and RTO ≤2 hours. Revisit after baseline traffic is measured.

## Dashboards

Create Grafana views for request rate/latency/errors, DB CPU/connections/locks/replication/WAL, Redis memory and queue lag, validation conflicts, ledger append failures, low-stock alert delivery, login/OTP failures, and container saturation. Sentry captures unhandled application errors with request IDs.

## Alerts

Page on elevated 5xx, failed stock validations, database unavailable, replication/PITR failure, queue lag affecting reorder alerts, exhausted disk, or certificate expiry. Ticket on sustained latency, search degradation, or low-stock notification backlog.

## Backup and recovery

Use pgBackRest for encrypted continuous WAL archiving and scheduled full/differential backups. Test restore quarterly. Store backup credentials separately, restrict access, and monitor last successful archive. Recovery procedures are in `docs/runbooks/database-restore.md` and `disaster-recovery.md`.

## Escalation

1. On-call engineer acknowledges and creates incident record.
2. Inventory domain owner joins for stock/ledger issues.
3. Security owner joins for identity, secret, or data exposure.
4. Incident commander coordinates communications and approves rollback or read-only mode.
5. Post-incident review documents timeline, impact, root cause, and corrective actions.

## Safe operational modes

If ledger integrity is uncertain, disable stock-changing commands with a feature flag and keep reads available. Never repair balances by editing ledger rows; use a reviewed adjustment operation with evidence.
