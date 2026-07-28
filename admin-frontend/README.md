# Ubuhinzi Admin Console

Next.js (App Router, TypeScript, Tailwind CSS) frontend for government officers and national admins to manage the Ubuhinzi platform: officer accounts, buyer verification, land/harvest/livestock oversight, resource & storage request decisions, farmer issue resolution, AI conversation oversight, and district/national AI insights & forecasts.

This app talks to the backend documented in the parent [`ubuhinzi`](../README.md) repo's `officer/`, `district/`, `sector/`, and `national/` endpoints — the ones intentionally excluded from the citizen-facing API docs there.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your backend
npm run dev
```

Open http://localhost:3000 — you'll land on `/login`.

## Auth

Sign in with an existing officer or national-admin account (`POST /auth/officer/login/` on the backend). Tokens are kept in browser storage via a Zustand store (`src/lib/auth-store.ts`) and attached to every request by `src/lib/api.ts`, which also transparently refreshes an expired access token and unwraps the backend's `{status, data, message, errors}` envelope.

## Role-aware navigation

The sidebar (`src/components/AppShell.tsx`) shows only the sections a given `user_level` can actually reach, matching the backend's permission classes:

| Section | national_admin | district_officer | sector_officer | cell_officer |
|---|---|---|---|---|
| Officers | creates/lists district officers | creates/lists sector officers | creates/lists cell officers | — |
| Buyers | ✓ | — | — | — |
| Lands / Harvest / Livestock / Resource & Storage Requests / Issues / AI Conversations | ✓ | ✓ | ✓ | ✓ |
| Insights / Forecast | ✓ | ✓ | — | — |

All jurisdiction-scoped lists (lands, harvest reports, livestock, requests, issues, AI conversations) are filtered server-side to the logged-in officer's territory — the frontend doesn't need to (and can't) apply its own scoping.

## Known backend gaps reflected here

- There is no API to look up District/Sector/Cell/Crop names by ID — the backend only exposes officer creation and forecast endpoints that take raw numeric IDs. The relevant forms here (officer creation, forecast query) currently take a plain ID input rather than a searchable dropdown; swap these for a proper lookup once such an endpoint exists.
- The USSD webhook (`reports/views/common/ussd.py`) exists in the backend but isn't yet wired into `reports/urls.py`, so it has no effect here either way.

## Structure

```
src/
  app/
    login/                    public login page
    (dashboard)/              auth-guarded route group, wrapped in AppShell
      dashboard/               role-aware landing page (today's insight, for national/district)
      officers/                officer roster + creation (role-dependent target level)
      buyers/                  buyer verification (national only)
      lands/, harvest-reports/, livestock/   read-only oversight lists
      resource-requests/, storage-requests/  oversight lists + approve/reject/deliver actions
      issues/                  farmer issue oversight + resolve/reject
      ai-conversations/        AI chat oversight list + read-only transcript view
      insights/, forecast/     national/district AI insight & forecast
  components/
    AppShell.tsx               sidebar + topbar, role-filtered nav
    ui.tsx                     shared primitives: Card, DataTable, StatusBadge, Pagination, etc.
  lib/
    api.ts                     fetch wrapper: auth header, 401 refresh, envelope unwrapping
    auth-store.ts               Zustand store (tokens + user, persisted)
    hooks.ts                    usePaginatedList / useList data-fetching hooks
    types.ts                    TypeScript types mirroring the backend's serializers
```
