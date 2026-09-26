# Runbook: Application Rollback

1. Confirm the incident, current release SHA, target known-good SHA, and schema compatibility.
2. Freeze unrelated deploys and announce rollback scope.
3. If a feature flag can safely disable the change, prefer that first.
4. Deploy the signed known-good image by immutable digest; never use a floating tag.
5. Run health checks, authentication smoke test, dashboard read, and a non-destructive operation lookup.
6. For migrations, use the documented expand/contract path. Never down-migrate production without an approved recovery plan.
7. Monitor latency, 5xx, queue lag, database locks, and stock validation failures for at least one observation window.
8. Record the rollback and open a post-incident action to fix the release pipeline or defect.
