# reports — Citizen-facing API

> This document covers only citizen-facing endpoints. Every `officer/...` endpoint (`officer/ai-conversations/`, `officer/issues/`, issue resolution) is administrative and is intentionally **not** documented here — see the note at the top of the root [`README.md`](../README.md).

Mount point: `/api/v1/messaging/`

All responses are wrapped in the standard envelope described in the [root README](../README.md#response-envelope).

**Auth:** every endpoint in this document requires `Authorization: Bearer <access_token>` (`401` if missing/invalid/expired), except the USSD webhook noted at the bottom.

**Note on pagination:** unlike the `production` app, the two list endpoints below (`conversations/`, `conversations/<public_id>/messages/`) are **not** paginated — `data` is a plain JSON array, not the `{count, next, previous, results}` shape.

## Shared vocabulary

- **Channel** (`channel`): `"ai"` (AI chatbot conversation) | `"officer"` (chat with the farmer's assigned cell officer, routed by category).
- A conversation's `(farmer, channel[, officer])` is unique — starting a conversation on a channel you already have one on returns the existing one rather than creating a duplicate.

---

## `GET` / `POST /api/v1/messaging/conversations/`

List the authenticated farmer's conversations (both as farmer and, for officers, conversations where they're the assigned officer — not relevant to citizen clients), or start a new one.

### `GET` — `200 OK`

Plain array (not paginated) of:

```json
{
  "public_id": "b2c3d4e5-...",
  "channel": "ai",
  "officer": null,
  "related_issue": null,
  "created_at": "2026-07-01T09:00:00Z",
  "updated_at": "2026-07-01T09:05:00Z"
}
```

For an officer-channel conversation, `officer` is populated with the assigned officer's [`MeSerializer`](../users/README.md#get-apiv1authme) shape; `related_issue` holds the linked `FarmerIssue` id once one exists (e.g. after an escalation).

### `POST` — request body

```json
{ "channel": "ai" }
```

or, to start/reuse an officer chat:

```json
{ "channel": "officer", "category": "crop" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `channel` | `"ai"` \| `"officer"` | yes | |
| `category` | `"crop"` \| `"livestock"` | required when `channel="officer"` | Determines whether this routes to the cell's agronomist or veterinary officer. |

### `201 Created`

Same shape as a list item.

### Errors

- `400` — `{"category": ["Required to route to the right officer."]}` — `channel="officer"` without `category`.
- `400` — `{"non_field_errors": ["Register a village on your profile before messaging your cell officer."]}` — caller's `village` is not set (see [`PATCH /api/v1/auth/me/`](../users/README.md#put--patch-apiv1authme)).
- `400` — `{"non_field_errors": ["No officer covering 'crop' issues is currently assigned to your cell."]}` — no active officer with the matching specialization is assigned to the farmer's cell yet.

---

## `GET` / `POST /api/v1/messaging/conversations/<uuid:public_id>/messages/`

List or send messages in a conversation. The caller must be a participant (the farmer or the assigned officer).

### `GET` — `200 OK`

Plain array (not paginated) of:

```json
{
  "id": 10,
  "conversation": 3,
  "sender": { "...": "MeSerializer shape, or null for an AI reply" },
  "is_ai_message": false,
  "body": "My beans are showing yellow leaves, what should I do?",
  "attachments": [
    {
      "id": 5,
      "file": "https://.../ubuhinzi/chat_attachments/2026/7/<uuid>-photo.jpg",
      "thumbnail": "https://.../ubuhinzi/chat_thumbnails/2026/7/<uuid>-photo.jpg",
      "file_type": "image/jpeg",
      "hls_master": null,
      "hls_720": null,
      "processing_status": "not_needed"
    }
  ],
  "created_at": "2026-07-01T09:00:00Z"
}
```

`sender` is `null` when `is_ai_message: true` (the message is the AI's own reply).

`attachments[].processing_status` is one of `"not_needed"` | `"pending"` | `"processing"` | `"ready"` | `"failed"` — only meaningful for **video** attachments, which are transcoded to HLS asynchronously; `hls_master`/`hls_720` are populated once `processing_status="ready"`. Image/audio/document attachments are always `"not_needed"` and immediately usable via `file`.

### `POST` — request body

`multipart/form-data` (required for file upload support):

| Field | Type | Required | Notes |
|---|---|---|---|
| `body` | string | one of `body`/`attachment` required | Free text. |
| `attachment` | file | one of `body`/`attachment` required | Image, audio, video, or document. |

If the conversation's `channel="ai"`, the platform's Gemini-backed assistant automatically generates and appends a reply in the same request (understands text, images, and audio natively — e.g. a farmer can send a photo of a diseased crop or a voice note describing a problem).

### `201 Created`

Array containing the created message, and — for `channel="ai"` conversations — a second element which is the AI's reply message (same shape as a `GET` item, `is_ai_message: true`, `sender: null`). For `channel="officer"` conversations, the array contains only the sent message.

### Errors

- `400` — `{"non_field_errors": ["A message needs a body, an attachment, or both."]}`
- `403` — `{"detail": "You are not a participant in this conversation."}`
- `404` — `public_id` doesn't exist.

---

## `POST /api/v1/messaging/conversations/<uuid:public_id>/escalate/`

Escalate an **AI** conversation to a human cell officer, creating a `FarmerIssue` and an officer-channel conversation (reusing an existing one if the farmer already has one with that officer). Only the farmer who owns the AI conversation can escalate it.

### Request body

```json
{
  "land": 1,
  "description": "The AI couldn't diagnose this, leaves are curling and turning brown."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `land` | integer (Land id) | exactly one of `land`/`livestock_location` | Must belong to the authenticated user. |
| `livestock_location` | integer (LivestockLocation id) | exactly one of `land`/`livestock_location` | Must belong to the authenticated user. |
| `description` | string | yes | |

### `201 Created`

```json
{
  "issue": {
    "id": 8,
    "category": "crop",
    "land": 1,
    "livestock_location": null,
    "description": "The AI couldn't diagnose this, leaves are curling and turning brown.",
    "status": "assigned",
    "reporter": { "...": "MeSerializer shape" },
    "assigned_officer": { "...": "MeSerializer shape" },
    "officer_response": "",
    "resolved_at": null,
    "created_at": "2026-07-01T09:10:00Z",
    "latitude": -1.9441,
    "longitude": 30.0619,
    "cell_name": "Kimisagara",
    "ai_query": {
      "id": 42,
      "query_type": "crop_diagnosis",
      "model_used": "gemini-2.5-flash",
      "input_text": "My beans are showing yellow leaves, what should I do?",
      "input_image": "https://.../ubuhinzi/ai_query_images/2026/7/<uuid>-photo.jpg",
      "input_audio": null,
      "response_text": "This looks like early-stage nitrogen deficiency...",
      "confidence_score": null,
      "created_at": "2026-07-01T09:05:00Z"
    }
  },
  "officer_conversation": { "...": "same shape as a conversations/ list item, channel=\"officer\"" }
}
```

`issue.status` is one of `"open"` | `"assigned"` | `"resolved"` | `"rejected"` — always `"assigned"` immediately after escalation.

`issue.latitude`/`issue.longitude`/`issue.cell_name` are read off the issue's land or livestock location's cell (whichever the issue targets) — all `null` if that cell has no coordinates on file.

`issue.ai_query` is `null` unless the AI conversation had already produced at least one reply before escalation, in which case it's the most recent one: what the farmer asked (and any photo/voice note attached, via `input_image`/`input_audio`), what model answered, and what it said — so an officer picking up the issue can see what the AI already tried before them. `query_type` is one of `"crop_diagnosis"` | `"livestock_query"` | `"general_qa"` | `"insight_generation"` | `"voice_message"`.

### Errors

- `400` — `{"non_field_errors": ["Provide exactly one of land or livestock_location."]}`
- `400` — `{"non_field_errors": ["This land/livestock does not belong to you."]}`
- `400` — `{"non_field_errors": ["No officer covering 'crop' issues is currently assigned to this cell."]}`
- `403` — `{"detail": "Only an AI conversation can be escalated."}` — attempted to escalate an already-`officer` conversation.
- `404` — `public_id` doesn't exist, or doesn't belong to the caller.

---

## USSD (feature-phone) reporting — not yet live

`reports/views/common/ussd.py` implements an Africa's Talking-compatible USSD webhook (`POST`, form-encoded, `AllowAny`) that lets a registered farmer describe a crop/livestock problem over USSD and get a short AI-generated reply via SMS-style text (creates the same `Conversation`/`Message` records as the app, tagged `source="ussd"`). **As of this writing it is implemented but not yet wired into `reports/urls.py`**, so it has no live path under `/api/v1/messaging/` — it is not part of the current API surface. It will be documented here once routed.
