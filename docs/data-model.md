# StockSense Data Model

## 1. Core entities

| Entity | Purpose | Key constraints |
|---|---|---|
| User | Identity, role, responsible user | unique loginId and email |
| Warehouse | Facility and reference prefix | unique code |
| Location | Storage/operational location | belongs to one warehouse |
| Product | Catalog item | unique SKU |
| StockLevel | Product balance per location | unique product/location |
| Operation | Receipt, delivery, transfer, adjustment document | unique reference, lifecycle status |
| OperationLine | Product quantity on an operation | cascade-delete only before validation |
| StockMove | Immutable movement ledger row | one row per product impact |

## 2. Invariants

- `onHand >= 0`, `reserved >= 0`, and `reserved <= onHand` unless an explicitly approved backorder policy is added.
- A Done operation is immutable; its stock moves are immutable.
- A StockMove has at least one location endpoint; internal moves have both source and destination.
- Delivery validation must lock and re-check all affected stock levels.
- Adjustment delta is `counted - recorded`; the ledger quantity is the absolute impact with signed direction represented by operation type/metadata.
- Reference generation is atomic per warehouse and operation type; never derive uniqueness from client input.

## 3. Indexing and query strategy

- Unique indexes: User(loginId), User(email), Warehouse(code), Product(sku), Operation(reference).
- Composite unique: StockLevel(productId, locationId).
- Operational indexes: Operation(type, status, scheduledDate); Operation(contact); StockMove(date); StockMove(productId, date); StockMove(reference).
- Add full-text/Meilisearch indexing for SKU, product name, and contact after baseline query profiling.

## 4. Transaction recipes

**Receipt:** lock operation; ensure Ready; upsert/increment StockLevel; insert one IN move per line; mark Done.

**Delivery:** lock operation and all StockLevels in deterministic product/location order; ensure Free to Use for every line; decrement; insert OUT moves; mark Done. On failure, mark Waiting without changing stock.

**Internal transfer:** lock source and destination rows; decrement source, increment destination; insert INTERNAL move; mark Done.

**Adjustment:** lock stock row; compute delta from current recorded quantity; set counted quantity; insert ADJUSTMENT move; mark Done.

## 5. Retention and privacy

Keep ledger and validated operations for the configured business retention period. Redact or minimize contact/address data in logs. User deletion is a controlled deactivation/anonymization workflow, not a hard delete that breaks audit relationships.
