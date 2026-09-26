# StockSense Product Requirements

## 1. Purpose and outcomes

StockSense replaces registers, spreadsheets, and scattered tracking with a centralized, real-time inventory system. The system must preserve an immutable transaction-level stock ledger, prevent stockouts through reorder thresholds, and streamline receiving, picking, packing, transfers, shelving, and counting.

### Personas

| Persona | Primary responsibilities |
|---|---|
| Inventory Manager | Catalog, reorder rules, receipts, delivery orders, warehouses, metrics, adjustments |
| Warehouse Staff | Picking, packing, shelf placement, transfers, counts, receipt validation |

## 2. Scope

**In scope:** authentication and OTP recovery; products and categories; multi-warehouse locations; receipts; delivery orders; internal transfers; adjustments; stock availability; move history; dashboard KPIs; filters; alerts; profile and logout.

**Out of scope for the baseline:** purchasing, invoicing, accounting valuation, supplier payments, barcode hardware integration, and native mobile apps.

## 3. Navigation and screens

Persistent navigation contains Dashboard; Operations (Receipts, Delivery Orders, Inventory Adjustments, Internal Transfers); Products/Stock; Move History; Settings (warehouses and locations); and Profile (profile, logout). The mock-up additionally establishes list and detail views for stock, warehouse, location, receipts, deliveries, and the dashboard.

## 4. Functional requirements

### Authentication

- Sign in with Login ID and password; success routes to Dashboard.
- Failed credentials show exactly `Invalid Login Id or Password`.
- Sign up requires unique Login ID (6–12 alphanumeric characters), unique standard-format email, password of at least 8 characters with lowercase, uppercase, and special character, and exact confirmation match.
- Password reset uses a time-bound, single-use OTP. Never reveal whether an account exists.
- Sessions are secure, revocable, and role-aware.

### Products and stock

- Create/update products with name, SKU/code, category, unit of measure, per-unit cost, reorder threshold, and optional initial stock.
- SKU search is substring/typo-tolerant where search service is enabled.
- Stock availability shows Product, Per Unit Cost, On Hand, Reserved, and Free to Use (`onHand - reserved`) by location.
- Low-stock means on-hand below the configured threshold; out-of-stock means free-to-use is zero for an active demand.

### Dashboard

Show total products in stock, low/out-of-stock items, pending receipts, pending deliveries, and scheduled internal transfers. Receipt and delivery widgets distinguish Late, Waiting, and Operations. Global filters cover document type, status, warehouse/location, and product category.

Definitions: **Late** = scheduled date before today and not Done; **Operations** = active document with scheduled date today or later; **Waiting** = outgoing work blocked by insufficient free-to-use stock.

### Operations

- **Receipt:** Draft → Ready (`TODO`) → Done (`Validate`); cancel before validation. Validation increases stock and writes green inbound ledger rows.
- **Delivery:** Draft → Waiting when stock is insufficient → Ready → Done; validation decreases stock and writes red outbound ledger rows. Out-of-stock lines are highlighted.
- **Internal transfer:** move product from source to destination; total company inventory remains unchanged while location balances change.
- **Adjustment:** select product/location, enter counted quantity, compute `delta = counted - recorded`, update stock, and write an adjustment ledger row.
- References follow `<warehouse>/<operation>/<id>`, e.g. `WH/IN/0001`, `WH/OUT/0001`, `WH/INT/0001`, `WH/ADJ/0001`.

### Ledger

Every validated stock impact is immutable and chronological. A multi-line operation creates one ledger row per product line. Rows include reference, date, product, source, destination, quantity, contact, status, and direction.

## 5. Non-functional requirements

- Authorization on every operational endpoint; server-side validation is authoritative.
- Stock validation and ledger append occur in one database transaction with row locking/idempotency.
- Auditability: no hard deletion of validated operations, stock levels, or ledger moves.
- Usability: list view is default; search and Kanban toggle are available for receipts and deliveries.
- Accessibility: keyboard navigation, visible focus, semantic labels, and WCAG 2.1 AA target.
- Performance target: p95 read API <500 ms and p95 validation command <1 s under baseline load.

## 6. Acceptance criteria

1. A validated receipt of 50 Steel Rods increases the selected location by 50 and creates an inbound ledger row.
2. A delivery exceeding Free to Use becomes Waiting, identifies the blocked line, and does not decrement stock.
3. A valid internal transfer changes source/destination balances but preserves company total.
4. An adjustment from 100 recorded to 97 counted changes stock by -3 and records the delta.
5. Duplicate references and duplicate SKU/email/login ID are rejected deterministically.
6. Every dashboard KPI matches its documented definition under the active filters.
7. A validated document cannot be edited or revalidated; cancellation cannot alter a Done document.
