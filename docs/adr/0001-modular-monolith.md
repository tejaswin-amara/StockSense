# ADR 0001: Use a Modular Monolith

- Status: Accepted
- Date: 2026-09-26

## Context
Stock validation requires atomic updates to balances and an immutable ledger. The initial product has a small number of bounded domains and no measured need for independent service scaling.

## Decision
Use a modular monolith with explicit Identity, Catalog, Facilities, Inventory, Operations, Ledger, Dashboard, Search/Notifications, and Reporting modules. Add a worker only for asynchronous work that cannot remain in the request transaction.

## Consequences
Transactions and local development stay simple, while module boundaries prepare for later extraction. The application must enforce boundaries in code review and tests. Service extraction is permitted only after measured load, team ownership, or reliability constraints justify it.
