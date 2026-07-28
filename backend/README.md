# Ubuhinzi API

Django REST backend for Ubuhinzi, a citizen-facing agriculture platform for Rwanda (land registration, harvest/livestock reporting, government resource requests, produce marketplace, AI farming assistant, and issue escalation to local agriculture officers).

> **Scope of these docs.** This root file and every per-app `README.md` in this repository (`users/README.md`, `production/README.md`, `reports/README.md`, `notifications/README.md`, `ai/README.md`) document **only the client-side / citizen (and buyer) surface** of the API — i.e. the endpoints consumed by the farmer-facing and buyer-facing mobile/web apps.
>
> Endpoints under any `officer/`, `district/`, `sector/`, or `national/` path (used by government officers and admins) are **out of scope** for these documents. Those are consumed by a separate, internal admin frontend and are intentionally not documented here.

## Base URL

```
/api/v1/
```

| App | Mount point |
|---|---|
| `users` | `/api/v1/auth/` |
| `reports` | `/api/v1/messaging/` |
| `production` | `/api/v1/production/` |
| `ai` | `/api/v1/ai/` (admin-only, see [`ai/README.md`](ai/README.md)) |

## Authentication

All endpoints except registration, login, Google sign-in, and `check-availability` require a JWT access token (SimpleJWT):

```
Authorization: Bearer <access_token>
```

- **Access token lifetime:** 2 hours
- **Refresh token lifetime:** 14 days (not rotated on refresh)
- Obtain tokens via `POST /api/v1/auth/login/` (citizen) or `POST /api/v1/auth/buyers/login/` (buyer), or `POST /api/v1/auth/google/`.
- Refresh an expired access token via `POST /api/v1/auth/token/refresh/` (see [`users/README.md`](users/README.md)).

## Response envelope

**Every** response — success or error — is wrapped in the same JSON shape by `config/renderers.py` and `config/exceptions.py`. Per-endpoint docs below describe only the contents of `data` (success) or `errors` (failure); the outer envelope is always as shown here.

### Success envelope

```json
{
  "status": "success",
  "status_code": 200,
  "data": { "...": "endpoint-specific payload, see each endpoint below" },
  "message": null,
  "errors": null
}
```

### Error envelope

```json
{
  "status": "error",
  "status_code": 400,
  "data": null,
  "message": "A short, human-readable summary of the first error",
  "errors": { "...": "raw DRF error detail, shape varies by error type (see below)" }
}
```

`errors` mirrors DRF's native error output before wrapping, so its shape depends on the failure:

- **Field validation errors** (`400 Bad Request`): `{"field_name": ["Error message."], "another_field": ["Error message."]}`
- **Non-field validation errors** (`400 Bad Request`): `{"non_field_errors": ["Error message."]}`
- **Auth/permission failures** (`401` / `403`): `{"detail": "Error message."}`
- **Not found** (`404`): `{"detail": "Not found."}`

### Common HTTP status codes

| Status | Meaning | When |
|---|---|---|
| `200 OK` | Success | GET, or a POST/PATCH that doesn't create a resource |
| `201 Created` | Resource created | Successful POST that creates a row (register, create land report, send message, etc.) |
| `400 Bad Request` | Validation failed | Missing/invalid fields, business-rule violation (e.g. "quantity exceeds remaining") |
| `401 Unauthorized` | Missing/invalid/expired JWT | No `Authorization` header, or token expired/invalid |
| `403 Forbidden` | Authenticated but not allowed | Wrong account type/level for this endpoint, disabled account, not a participant |
| `404 Not Found` | Resource doesn't exist (or isn't yours) | Object lookups scope to the requesting user, so another user's object 404s rather than 403s |

## Pagination

`ListCreateAPIView`/`ListAPIView` endpoints (any endpoint documented below as returning a **list**) use DRF's `PageNumberPagination`, page size **50**. The `data` field of the envelope for a paginated list is:

```json
{
  "count": 132,
  "next": "http://.../api/v1/production/lands/?page=3",
  "previous": "http://.../api/v1/production/lands/?page=1",
  "results": [ "...": "array of items, see each endpoint" ]
}
```

Request an explicit page with `?page=<n>`.

## Per-app documentation

- [`users/README.md`](users/README.md) — registration, login (citizen + buyer), Google sign-in, profile, buyer registration
- [`production/README.md`](production/README.md) — land, harvest, livestock, resource requests, storage requests, marketplace listings
- [`reports/README.md`](reports/README.md) — AI chat / officer chat conversations and messages, escalation
- [`notifications/README.md`](notifications/README.md) — in-app notifications (model exists; no API surface yet)
- [`ai/README.md`](ai/README.md) — admin-only app, not part of the citizen/buyer API surface
