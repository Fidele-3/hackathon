# users — Citizen & Buyer API

> This document covers only citizen- and buyer-facing endpoints. Officer/district/sector/national account-management endpoints (`officer/login/`, `officers/district/`, `officers/sector/`, `officers/cell/`, `buyers/` list & verify) are administrative and are intentionally **not** documented here — see the note at the top of the root [`README.md`](../README.md).

Mount point: `/api/v1/auth/`

All responses are wrapped in the standard envelope described in the [root README](../README.md#response-envelope). Only the `data` payload is shown below.

---

## `POST /api/v1/auth/register/`

Register a new citizen (farmer) account.

**Auth:** none (`AllowAny`)

### Request body

```json
{
  "phone_number": "+250788000000",
  "email": "farmer@example.com",
  "national_id": "1198000000000000",
  "full_name": "Jean Mugisha",
  "dob": "1990-05-12",
  "gender": "male",
  "village": 1,
  "password": "a-strong-password"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `phone_number` | string | yes | Unique. Used as login identifier. |
| `email` | string (email) | no | Unique if provided. |
| `national_id` | string | yes | Unique. |
| `full_name` | string | yes | Max 150 chars. |
| `dob` | string (`YYYY-MM-DD`) | no | |
| `gender` | `"male"` \| `"female"` | no | |
| `village` | integer (Village id) | no | FK id. |
| `password` | string | yes | Min length 8, validated against Django's password validators (not too common, not all-numeric, not too similar to other fields). |

### `201 Created`

```json
{
  "public_id": "a1b2c3d4-...",
  "phone_number": "+250788000000",
  "email": "farmer@example.com",
  "national_id": "1198000000000000",
  "full_name": "Jean Mugisha",
  "dob": "1990-05-12",
  "gender": "male",
  "village": 1,
  "password": "..."
}
```
Note: the response is the raw serializer output (including write-only `password` key with an empty/omitted value per DRF's write-only handling — clients should not rely on reading it back).

### Errors

- `400` — any field invalid, or `phone_number` / `national_id` / `email` already taken (returned as field-level errors, e.g. `{"phone_number": ["user with this phone number already exists."]}`).

---

## `POST /api/v1/auth/login/`

Citizen login. Rejects any non-citizen account (buyers/officers must use their own login endpoints).

**Auth:** none (`AllowAny`)

### Request body

```json
{
  "identifier": "+250788000000",
  "password": "a-strong-password"
}
```

`identifier` may be a phone number or email.

### `200 OK`

```json
{
  "access": "<jwt>",
  "refresh": "<jwt>",
  "user": { "...": "see MeSerializer shape below" }
}
```

### Errors

- `401` — `{"detail": "Invalid credentials."}` — identifier/password mismatch.
- `403` — `{"detail": "Account disabled."}` — account `is_active=false`.
- `403` — `{"detail": "This account type is not allowed to log in here."}` — e.g. a buyer or officer account used against this endpoint.

---

## `POST /api/v1/auth/google/`

Sign in (or sign up) with a Google ID token.

**Auth:** none (`AllowAny`)

### Request body

```json
{
  "id_token": "<google-id-token>",
  "phone_number": "+250788000000",
  "national_id": "1198000000000000"
}
```

| Field | Required | Notes |
|---|---|---|
| `id_token` | yes | Verified server-side against `GOOGLE_OAUTH_CLIENT_ID`. |
| `phone_number` | only for first-time sign-up | Required if no existing account matches the Google account. |
| `national_id` | only for first-time sign-up | Required if no existing account matches the Google account. |

Matching order: existing user with this `google_sub` → existing user with this Google account's `email` (linked automatically) → otherwise a new citizen account is created (requires `phone_number` + `national_id` in the request).

### `200 OK`

Same shape as `POST /login/`: `{"access", "refresh", "user"}`.

### `400 Bad Request`

Returned as a **raw** (non-envelope-error) body when `phone_number`/`national_id` are missing on first-time sign-up — this endpoint returns the response directly rather than raising a DRF validation error:

```json
{
  "detail": "phone_number and national_id are required to complete Google sign-up.",
  "missing_fields": ["phone_number", "national_id"]
}
```

### Other errors

- `401` — `{"detail": "Invalid Google token."}` — token failed verification.

---

## `POST /api/v1/auth/token/refresh/`

Standard SimpleJWT refresh endpoint.

**Auth:** none (`AllowAny`)

### Request body

```json
{ "refresh": "<refresh_token>" }
```

### `200 OK`

```json
{ "access": "<new_access_token>" }
```

### Errors

- `401` — `{"detail": "Token is invalid or expired", "code": "token_not_valid"}` — expired/blacklisted/malformed refresh token.

---

## `GET /api/v1/auth/check-availability/`

Check whether a phone number, email, national ID, or land UPI is already taken — used for live validation on registration forms.

**Auth:** none (`AllowAny`)

### Query params

| Param | Required | Values |
|---|---|---|
| `field` | yes | one of `"phone_number"`, `"email"`, `"national_id"`, `"upi"` |
| `value` | yes | the value to check |

Example: `GET /api/v1/auth/check-availability/?field=phone_number&value=%2B250788000000`

### `200 OK`

```json
{
  "field": "phone_number",
  "value": "+250788000000",
  "available": true
}
```

### Errors

- `400` — `field` missing/invalid, or `value` missing.

---

## `GET /api/v1/auth/me/`

Fetch the authenticated user's own profile.

**Auth:** required (any authenticated user — citizen, buyer, or officer)

### `200 OK` — `MeSerializer` shape

```json
{
  "public_id": "a1b2c3d4-...",
  "phone_number": "+250788000000",
  "email": "farmer@example.com",
  "national_id": "1198000000000000",
  "full_name": "Jean Mugisha",
  "dob": "1990-05-12",
  "gender": "male",
  "village": 1,
  "user_level": "citizen",
  "officer_profile": null,
  "buyer_profile": null
}
```

`user_level` is one of: `"citizen"`, `"buyer"`, `"cell_officer"`, `"sector_officer"`, `"district_officer"`, `"national_admin"`.

For a buyer account, `buyer_profile` is populated:

```json
{
  "business_name": "Kigali Fresh Produce Ltd",
  "assigned_cells": [12, 45],
  "payment_method": "mobile_money",
  "is_verified": true
}
```
`payment_method` is one of `"mobile_money"`, `"bank"`, `"cash"`.

For an officer account, `officer_profile` is populated (shown for completeness — not relevant to citizen/buyer clients):

```json
{
  "level": "cell",
  "specialization": "agronomist",
  "managed_district": null,
  "managed_sector": null,
  "managed_cell": 12,
  "work_email": null
}
```

### Errors

- `401` — missing/invalid/expired token.

---

## `PUT` / `PATCH /api/v1/auth/me/`

Update the authenticated user's own profile.

**Auth:** required

### Request body

Any subset of the writable `MeSerializer` fields: `phone_number`, `email`, `dob`, `gender`, `village`. (`public_id`, `national_id`, and `user_level` are read-only and ignored if sent.)

### `200 OK`

Same shape as `GET /me/`.

### Errors

- `400` — e.g. `phone_number`/`email` already taken by another account.
- `401` — missing/invalid/expired token.

---

## `POST /api/v1/auth/buyers/register/`

Register a new produce-buyer account. Buyers start **unverified** (`is_verified: false`) and cannot see marketplace listings until a national admin verifies them (see [`production/README.md`](../production/README.md#get-apiv1productionbuyerlistings)).

**Auth:** none (`AllowAny`)

### Request body

```json
{
  "phone_number": "+250788111111",
  "email": "buyer@example.com",
  "national_id": "1198000000000001",
  "full_name": "Alice Uwase",
  "password": "a-strong-password",
  "business_name": "Kigali Fresh Produce Ltd",
  "payment_method": "mobile_money",
  "assigned_cell_ids": [12, 45]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `phone_number` | string | yes | Unique. |
| `email` | string (email) | no | Unique if provided. |
| `national_id` | string | yes | Unique. |
| `full_name` | string | yes | |
| `password` | string | yes | Min length 8, Django password validators. |
| `business_name` | string | yes | |
| `payment_method` | `"mobile_money"` \| `"bank"` \| `"cash"` | yes | |
| `assigned_cell_ids` | array of integers | yes | Non-empty; must be existing `Cell` ids. Determines which cells' listings this buyer can see once verified. |

### `201 Created` — `MeSerializer` shape (see `GET /me/` above), with `buyer_profile.is_verified: false`

### Errors

- `400` — `phone_number`/`national_id`/`email` already registered, or `assigned_cell_ids` contains a non-existent cell id (`{"assigned_cell_ids": ["One or more cells do not exist."]}`), or weak password.

---

## `POST /api/v1/auth/buyers/login/`

Buyer login. Rejects any non-buyer account.

**Auth:** none (`AllowAny`)

### Request body

Same shape as citizen login: `{"identifier", "password"}`.

### `200 OK`

Same shape as citizen login: `{"access", "refresh", "user"}`.

### Errors

Same as citizen login (`401 Invalid credentials.`, `403 Account disabled.`, `403 This account type is not allowed to log in here.`).
