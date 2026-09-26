# StockSense API Contract

Base path: `/api/v1`. JSON is the default media type. All responses include `requestId`; mutation requests accept an `Idempotency-Key`.

## Authentication

| Method | Path | Description |
|---|---|---|
| POST | `/auth/sign-up` | Create user after validation |
| POST | `/auth/sign-in` | Create secure session |
| POST | `/auth/forgot-password` | Send OTP without account enumeration |
| POST | `/auth/reset-password` | Consume OTP and set password |
| POST | `/auth/sign-out` | Revoke current session |
| GET | `/me` | Current user/profile |

## Resources

- `GET/POST /products`; `GET/PATCH /products/{id}`; `GET /products/{id}/availability`.
- `GET/POST /warehouses`; `GET/PATCH /warehouses/{id}`; `GET/POST /warehouses/{id}/locations`.
- `GET /operations?type=&status=&warehouseId=&category=&q=&page=`.
- `POST /receipts`, `GET/PATCH /receipts/{id}`, `POST /receipts/{id}/todo`, `POST /receipts/{id}/validate`, `POST /receipts/{id}/cancel`.
- `POST /deliveries`, `GET/PATCH /deliveries/{id}`, `POST /deliveries/{id}/ready`, `POST /deliveries/{id}/validate`, `POST /deliveries/{id}/cancel`.
- `POST /transfers`, `POST /transfers/{id}/validate`.
- `POST /adjustments`, `POST /adjustments/{id}/validate`.
- `GET /moves?productId=&reference=&from=&to=&direction=&page=`.
- `GET /dashboard?type=&status=&facilityId=&category=`.

## Lifecycle rules

- Receipt: Draft → Ready → Done; Draft/Ready → Canceled.
- Delivery: Draft → Waiting or Ready → Done; Draft/Waiting/Ready → Canceled.
- Transfer and adjustment use Draft → Ready → Done; cancellation is allowed before Done.
- Illegal transitions return `409 STATE_CONFLICT`; insufficient stock returns `409 INSUFFICIENT_STOCK` and leaves the operation unvalidated.

## Error envelope

```json
{"error":{"code":"VALIDATION_ERROR","message":"One or more fields are invalid","fields":{"sku":"Already in use"}},"requestId":"req_123"}
```

Standard codes: `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `STATE_CONFLICT`, `INSUFFICIENT_STOCK`, `IDEMPOTENCY_CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

## Authorization

Inventory Managers can manage catalog, facilities, all operations, adjustments, and reports. Warehouse Staff can read permitted facilities, execute assigned floor operations, validate receipts/transfers, and create counts; destructive configuration and user administration require manager role.

## Contract requirements

Publish OpenAPI 3.x; lint with Spectral; generate TypeScript types with openapi-typescript. Pagination is cursor-based for ledger/operations. Validation endpoints are idempotent: repeating the same successful key returns the original result, while a reused key with a different payload returns `IDEMPOTENCY_CONFLICT`.
