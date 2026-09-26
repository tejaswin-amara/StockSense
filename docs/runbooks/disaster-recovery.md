# Runbook: Disaster Recovery

## Activation
Incident commander activates when the primary region, database, or critical control plane cannot meet the RTO. Declare scope, start a timeline, and notify business owners.

## Recovery sequence

1. Provision the approved recovery environment from OpenTofu and immutable images.
2. Restore PostgreSQL using the latest valid pgBackRest backup and WAL; verify RPO.
3. Restore Redis/search only as rebuildable state; rebuild indexes and queues from durable records.
4. Configure DNS/reverse proxy, secrets, certificates, and observability.
5. Run schema, ledger reconciliation, auth, dashboard, receipt, delivery, and read-only smoke tests.
6. Open traffic gradually, keeping stock-changing operations gated until integrity is confirmed.
7. Monitor SLOs, queue replay, and reconciliation; communicate recovery status.
8. After stabilization, fail back through a planned migration and document lessons learned.

Exercise at least annually and after material architecture changes.
