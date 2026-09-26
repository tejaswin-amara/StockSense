# Runbook: Database Restore and PITR

## Preconditions
Confirm incident commander approval, target recovery time, RPO/RTO, latest successful pgBackRest backup/WAL archive, and a destination environment. Never experiment first on the only production database.

## Procedure

1. Put the application in read-only or maintenance mode and stop stock-changing workers.
2. Identify the restore target timestamp and verify backup integrity.
3. Restore to an isolated instance with pgBackRest; apply WAL to the target time.
4. Run schema checks, row counts, reference uniqueness checks, and ledger/stock reconciliation.
5. Compare the restored state with the incident timeline and capture evidence.
6. Promote only after approval; rotate connection credentials if compromise is suspected.
7. Restart workers with duplicate-safe idempotency and monitor queue replay.
8. Record RPO/RTO achieved, data loss (if any), and follow-up actions.

Test quarterly and after major backup configuration changes.
