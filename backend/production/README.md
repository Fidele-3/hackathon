# production — Citizen & Buyer API

> This document covers only citizen- and buyer-facing endpoints. Every `officer/...` endpoint (land/harvest/livestock oversight, resource-request and storage-request decisions) is administrative and is intentionally **not** documented here — see the note at the top of the root [`README.md`](../README.md).

Mount point: `/api/v1/production/`

All responses are wrapped in the standard envelope described in the [root README](../README.md#response-envelope). List endpoints return the [paginated shape](../README.md#pagination). Only the inner payload is shown below.

**Auth:** every endpoint in this document requires `Authorization: Bearer <access_token>` (`401` if missing/invalid/expired).

## Shared vocabulary

- **Season** (`season`): `"A"` (Sep–Feb), `"B"` (Mar–Jun), `"C"` (Jul–Aug) — Rwanda's 3-season agricultural calendar.
- **Source** (`source`, read-only, always `"farmer_reported"` for citizen-created records): `"farmer_reported"` | `"nisr_import"` | `"government_import"`.

---

## `GET` / `POST /api/v1/production/lands/`

List or register a plot of land owned by the authenticated farmer. Listing is scoped to the caller — you only ever see your own lands.

### `GET` — `200 OK`

Paginated list of:

```json
{
  "id": 1,
  "cell": 12,
  "upi": "1/02/03/04/0123",
  "hectares": "1.500",
  "planted_crop": 3,
  "season": "A",
  "season_year": 2026,
  "registered_at": "2026-07-01T09:00:00Z"
}
```

### `POST` — request body

```json
{
  "cell": 12,
  "upi": "1/02/03/04/0123",
  "hectares": 1.5,
  "planted_crop": 3,
  "season": "A",
  "season_year": 2026
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `cell` | integer (Cell id) | yes | |
| `upi` | string | yes | Unique nationwide (farmer-entered Unique Parcel Identifier). |
| `hectares` | decimal string/number | no | Up to 8 digits, 3 decimal places. |
| `planted_crop` | integer (Crop id) | no | |
| `season` | `"A"` \| `"B"` \| `"C"` | no | |
| `season_year` | integer | no | |

`owner` is set server-side to the authenticated user — do not send it.

### `201 Created`

Same shape as a list item, plus assigned `id` and `registered_at`.

### Errors

- `400` — `upi` already registered (`{"upi": ["land with this upi already exists."]}`), invalid `cell`/`planted_crop` id.

---

## `GET` / `POST /api/v1/production/livestock-locations/`

List or register a livestock holding (e.g. a barn/pasture with N animals of a given type) owned by the authenticated farmer.

### `GET` — `200 OK`

Paginated list of:

```json
{
  "id": 1,
  "cell": 12,
  "livestock_type": 2,
  "count": 5,
  "registered_at": "2026-07-01T09:00:00Z"
}
```

### `POST` — request body

```json
{ "cell": 12, "livestock_type": 2, "count": 5 }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `cell` | integer (Cell id) | yes | |
| `livestock_type` | integer (LivestockType id) | yes | |
| `count` | integer | no | Defaults to 1. |

### `201 Created`

Same shape as a list item.

### Errors

- `400` — invalid `cell`/`livestock_type` id.

---

## `GET` / `POST /api/v1/production/harvest-reports/`

List or submit a harvest report against one of the farmer's own lands.

### `GET` — `200 OK`

Paginated list of:

```json
{
  "id": 1,
  "land": 1,
  "crop": 3,
  "season": "A",
  "season_year": 2026,
  "quantity_kg": "1200.00",
  "source": "farmer_reported",
  "created_at": "2026-07-01T09:00:00Z"
}
```

### `POST` — request body

```json
{
  "land": 1,
  "crop": 3,
  "season": "A",
  "season_year": 2026,
  "quantity_kg": 1200.00
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `land` | integer (Land id) | yes | Must belong to the authenticated user. |
| `crop` | integer (Crop id) | yes | |
| `season` | `"A"` \| `"B"` \| `"C"` | yes | |
| `season_year` | integer | yes | |
| `quantity_kg` | decimal string/number | yes | Up to 12 digits, 2 decimal places. |

### `201 Created`

Same shape as a list item.

### Errors

- `400` — `{"land": ["This land does not belong to you."]}` — `land` id belongs to another user.
- `400` — invalid `crop` id, missing required field.

---

## `GET` / `POST /api/v1/production/livestock-production/`

List or submit a production report (milk, eggs, etc.) against one of the farmer's own livestock locations.

### `GET` — `200 OK`

Paginated list of:

```json
{
  "id": 1,
  "livestock_location": 1,
  "product_type": "milk",
  "season": "A",
  "season_year": 2026,
  "quantity": "300.00",
  "unit": "kg",
  "source": "farmer_reported",
  "created_at": "2026-07-01T09:00:00Z"
}
```

### `POST` — request body

```json
{
  "livestock_location": 1,
  "product_type": "milk",
  "season": "A",
  "season_year": 2026,
  "quantity": 300.00,
  "unit": "kg"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `livestock_location` | integer (LivestockLocation id) | yes | Must belong to the authenticated user. |
| `product_type` | string | yes | Free text, e.g. `"milk"`, `"eggs"`. |
| `season` | `"A"` \| `"B"` \| `"C"` | yes | |
| `season_year` | integer | yes | |
| `quantity` | decimal string/number | yes | Up to 12 digits, 2 decimal places. |
| `unit` | string | no | Defaults to `"kg"`. |

### `201 Created`

Same shape as a list item.

### Errors

- `400` — `{"livestock_location": ["This livestock location does not belong to you."]}`, missing required field.

---

## `GET` / `POST /api/v1/production/resource-requests/`

List or submit a request for a government resource (fertilizer, seed, veterinary medicine, feed) against a land **or** a livestock location. Creating a request auto-assigns it to the cell officer covering the relevant category (crop → agronomist, livestock → veterinary) for the target's cell.

### `GET` — `200 OK`

Paginated list of:

```json
{
  "id": 1,
  "land": 1,
  "livestock_location": null,
  "resource_type": "fertilizer",
  "fertilizer": 2,
  "quantity_requested": "50.00",
  "unit": "kg",
  "status": "pending",
  "assigned_officer": 7,
  "decision_comment": "",
  "requested_at": "2026-07-01T09:00:00Z",
  "decided_at": null,
  "delivered_at": null
}
```

`status` is one of `"pending"` | `"approved"` | `"rejected"` | `"delivered"` (all set/changed only by an officer; read-only for citizens).
`resource_type` is one of `"fertilizer"` | `"seed"` | `"medicine"` | `"feed"`.

### `POST` — request body

```json
{
  "land": 1,
  "resource_type": "fertilizer",
  "fertilizer": 2,
  "quantity_requested": 50.00,
  "unit": "kg"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `land` | integer (Land id) | exactly one of `land`/`livestock_location` | Must belong to the authenticated user. |
| `livestock_location` | integer (LivestockLocation id) | exactly one of `land`/`livestock_location` | Must belong to the authenticated user. |
| `resource_type` | `"fertilizer"` \| `"seed"` \| `"medicine"` \| `"feed"` | yes | |
| `fertilizer` | integer (Fertilizer id) | only when `resource_type="fertilizer"` | Ties to the government fertilizer catalog. |
| `quantity_requested` | decimal string/number | yes | Up to 12 digits, 2 decimal places. |
| `unit` | string | no | Defaults to `"kg"`. |

### `201 Created`

Same shape as a list item, with `status: "pending"`.

### Errors

- `400` — `{"non_field_errors": ["Provide exactly one of land or livestock_location."]}` — both or neither provided.
- `400` — `{"non_field_errors": ["This land/livestock does not belong to you."]}`
- `400` — `{"non_field_errors": ["No officer covering 'crop' requests is assigned to this cell."]}` — no active officer with the matching specialization is assigned to the target's cell yet.

---

## `GET` / `POST /api/v1/production/storage-requests/`

List or submit a request to store part of a harvest in a government warehouse. On creation, a warehouse in the farmer's district with free capacity for that crop/quantity is auto-assigned.

### `GET` — `200 OK`

Paginated list of:

```json
{
  "id": 1,
  "harvest_report": 1,
  "warehouse": 4,
  "quantity_kg": "500.00",
  "status": "requested",
  "decided_by": null,
  "decision_comment": "",
  "requested_at": "2026-07-01T09:00:00Z",
  "decided_at": null,
  "stored_at": null
}
```

`status` is one of `"requested"` | `"approved"` | `"stored"` | `"rejected"` (officer-controlled; read-only for citizens).

### `POST` — request body

```json
{ "harvest_report": 1, "quantity_kg": 500.00 }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `harvest_report` | integer (HarvestReport id) | yes | Must belong to the authenticated user (via its land). |
| `quantity_kg` | decimal string/number | yes | Up to 14 digits, 2 decimal places. Cannot exceed the harvest's remaining un-requested quantity (already-requested storage, excluding rejected requests, is subtracted). |

`warehouse` is assigned server-side — do not send it.

### `201 Created`

Same shape as a list item.

### Errors

- `400` — `{"non_field_errors": ["This harvest report is not yours."]}`
- `400` — `{"non_field_errors": ["Only 200.00kg of this harvest is not already requested for storage."]}`
- `400` — `{"non_field_errors": ["No government warehouse in your district currently has capacity for this crop/quantity."]}`

---

## `GET` / `POST /api/v1/production/listings/`

List or create the authenticated farmer's own marketplace listings (offering part of a harvest for sale to verified buyers). Listing is scoped to the caller.

### `GET` — `200 OK`

Paginated list of:

```json
{
  "id": 1,
  "harvest_report": 1,
  "quantity_available_kg": "300.00",
  "price_per_kg": "350.00",
  "status": "available",
  "reserved_by": null,
  "created_at": "2026-07-01T09:00:00Z"
}
```

`status` is one of `"available"` | `"reserved"` | `"sold"` (system/buyer-controlled; read-only for citizens). `price_per_kg: null` means the price is negotiable.

### `POST` — request body

```json
{
  "harvest_report": 1,
  "quantity_available_kg": 300.00,
  "price_per_kg": 350.00
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `harvest_report` | integer (HarvestReport id) | yes | Must belong to the authenticated user. |
| `quantity_available_kg` | decimal string/number | yes | Up to 14 digits, 2 decimal places. Cannot exceed the harvest report's `quantity_kg`. |
| `price_per_kg` | decimal string/number | no | Up to 10 digits, 2 decimal places. Omit/`null` for "negotiable". |

### `201 Created`

Same shape as a list item, with `status: "available"`.

### Errors

- `400` — `{"non_field_errors": ["This harvest report is not yours."]}`
- `400` — `{"non_field_errors": ["Cannot list more than the reported harvest quantity."]}`

---

## `GET /api/v1/production/buyer/listings/`

**Buyer-only.** List marketplace listings visible to the authenticated buyer: only `status="available"` listings whose land's cell is one of the buyer's `assigned_cells`, and only if the buyer's account is verified.

**Auth:** required. Non-buyer accounts, and unverified buyers, get an **empty list** (not an error) — `data.results: []`.

### `200 OK`

Paginated list of the same shape as `/listings/` above.

---

## `POST /api/v1/production/buyer/listings/<int:pk>/reserve/`

**Buyer-only.** Reserve an available listing (marks it `status="reserved"` and sets `reserved_by` to the calling buyer).

**Auth:** required, verified buyer account only.

### Request body

None.

### `200 OK`

The updated listing, same shape as a `/listings/` item, with `status: "reserved"` and `reserved_by: <buyer's user id>`.

### Errors

- `403` — `{"detail": "Only a verified buyer can reserve a listing."}` — caller is not a buyer, or not yet verified.
- `404` — listing doesn't exist, isn't `available`, or isn't in one of the buyer's assigned cells (all three cases 404 rather than differentiate, to avoid leaking which listings exist outside the buyer's territory).
