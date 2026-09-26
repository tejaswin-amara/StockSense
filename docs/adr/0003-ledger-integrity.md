# ADR 0003: Append-Only Ledger with Transactional Stock Mutations

- Status: Accepted
- Date: 2026-09-26

## Context
Inventory correctness is the central product promise. Duplicate requests, concurrent deliveries, and partial failures could otherwise corrupt balances.

## Decision
Every validated receipt, delivery, transfer, and adjustment updates StockLevel and appends StockMove rows in one transaction. A validation command locks affected rows in deterministic order and requires an idempotency key. Validated operations and moves cannot be edited or deleted.

## Consequences
The ledger is auditable and recoverable through reconciliation. Corrections require a new adjustment rather than manual edits. API clients must preserve idempotency keys and the operations domain must test concurrency and rollback behavior.
