# Runbook: Credential Rotation

1. Determine credential type, owner, consumers, expiry, and whether compromise is suspected.
2. Generate a replacement in the secret manager; do not paste it into tickets, chat, logs, or source.
3. Deploy dual-read/dual-key support when the dependency requires overlap.
4. Switch consumers, verify health and error rates, then revoke the old credential.
5. Invalidate sessions/tokens when identity credentials or signing keys are affected; communicate user impact.
6. Search repository and logs for exposure, and run Gitleaks/TruffleHog as appropriate.
7. Record rotation date, verification evidence, next expiry, and rollback approach.
