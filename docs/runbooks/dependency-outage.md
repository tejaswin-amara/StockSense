# Runbook: Dependency Outage

Identify whether the dependency is authentication/OTP, Redis/BullMQ, Meilisearch, observability, object storage, or an external API. Check provider status and local telemetry.

- Auth/OTP unavailable: keep existing sessions where safe, disable password reset temporarily, show a generic retry message, and never bypass identity checks.
- Redis/queue unavailable: keep synchronous stock transactions working if safe; pause non-critical alerts/reports and expose backlog metrics.
- Search unavailable: fall back to bounded PostgreSQL search; do not fail core stock operations.
- Observability unavailable: preserve structured local logs and page on the reduced-visibility condition.
- Object storage unavailable: reject uploads safely; never accept unvalidated files.

Set a feature flag or circuit breaker, communicate degraded mode, and restore normal operation only after health checks and backlog replay validation.
