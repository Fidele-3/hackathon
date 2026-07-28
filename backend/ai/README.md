# ai — admin-only app (not part of the citizen/buyer API)

> Per the note at the top of the root [`README.md`](../README.md), these docs cover only the citizen/buyer-facing API surface. **Every endpoint in this app is administrative.**

Mount point: `/api/v1/ai/`

All four routes in `ai/urls.py` (`insights/national/`, `insights/district/`, `forecast/national/`, `forecast/district/`) are read by government officers (district and national admin dashboards) — none are called by the farmer or buyer apps, so they are intentionally not documented here.

## Where citizens actually touch AI features

The AI assistant that citizens interact with (Gemini-backed chat, crop-photo diagnosis, voice messages, USSD reporting) is exposed through the **`reports`** app's conversation/message endpoints, not through this app directly — see [`reports/README.md`](../reports/README.md). This `ai` app owns the underlying Gemini client (`ai/gemini_client.py`), query logging (`AIQueryLog`), and the district/national insight & forecast generation consumed by the admin dashboards.

If citizen-facing endpoints are ever added directly to this app, they will be documented here.
