# ADR 0002: PostgreSQL with Prisma

- Status: Accepted
- Date: 2026-09-26

## Context
Stock levels, operation lifecycles, and ledger entries need relational constraints, transactions, row locks, and queryable history.

## Decision
Use PostgreSQL as the system of record and Prisma as the TypeScript ORM. Use PgBouncer for connection pooling. Migrations are reviewed, forward-compatible, and tested against a disposable database.

## Consequences
The team gets strong schema typing and transactional integrity. Query plans, lock contention, migration history, backup/restore, and pool limits must be observable. Drizzle, SQLAlchemy, or framework-neutral migration tools are alternatives only when the application archetype changes.
