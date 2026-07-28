# notifications — Citizen-facing API

> This document covers only citizen-facing endpoints, per the note at the top of the root [`README.md`](../README.md). There are currently none to document — see below.

Mount point: none yet. This app is **not included** in `config/urls.py` (`INSTALLED_APPS` includes `"notifications"` for its model/admin registration only; no `notifications.urls` is mounted).

## Current state

The `Notification` model exists (`notifications/models/notification.py`) but has no serializers, views, or URLs implemented yet — `notifications/views.py` is still the default Django scaffold. There is no API surface for citizens to list or mark notifications as read at this time.

### `Notification` model (for reference, not yet exposed via API)

| Field | Type | Notes |
|---|---|---|
| `recipient` | FK → User | |
| `notification_type` | string | one of `"issue_assigned"`, `"issue_resolved"`, `"announcement"` |
| `title` | string | max 200 chars |
| `message` | text | |
| `related_issue` | FK → `reports.FarmerIssue`, nullable | |
| `is_read` | boolean | defaults `false` |
| `created_at` | datetime | |

This document will be updated with real endpoint documentation once a citizen-facing API (e.g. `GET /api/v1/notifications/`, `POST /api/v1/notifications/<id>/read/`) is built.
