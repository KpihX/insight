# SapientAI frontend ✨

This directory contains the visible teacher-facing product surface of `SapientAI`.

It is the interface that reviewers can see, while the n8n-first operational backend lives in:

- [README.md](../README.md)
- [backend/README.md](../backend/README.md)

This repository now carries the local frontend source directly.

```text
frontend/ = the current SapientAI UI source of truth
```

## What the frontend is 🌬️

The frontend is a Vite + React teacher workspace prototype organized around four screens:

```text
Home     -> briefing + schedule preview + to-do
Inbox    -> event stream + detail panel + reply affordances
Tasks    -> action-required tasks grouped into boards
Calendar -> visual timetable with editable demo events
```

The current app already talks to the published backend routes and refreshes periodically for the main teacher profile:

```text
role    = teacher
staffId = staff_1
```

That is intentional for the hackathon demo flow.

The frontend runtime knobs now live in:

- [src/config/runtime.ts](src/config/runtime.ts)
- [.env.example](.env.example)

They centralize:

```text
USE_REAL_API
API_BASE_URL
DEFAULT_DASHBOARD_ROLE
DEFAULT_DASHBOARD_STAFF_ID
REFRESH_INTERVAL_MS
DEMO_CALENDAR_WEEK_START
```

## Current API integration 🔌

The API client lives in:

- [src/services/api.ts](src/services/api.ts)

The frontend currently calls:

```text
GET  /dashboard/brief
GET  /dashboard/feed
GET  /dashboard/event?id=...
POST /dashboard/action
```

Important implementation note:

```text
USE_REAL_API=true  -> published n8n backend
USE_REAL_API=false -> intentionally different local mock experience
```

The mock mode is intentionally kept visually and semantically different from the live Sarah Lee demo so reviewers can immediately tell which data source is active.

## Relevant local files 🗂️

```text
frontend/
├── package.json
├── src/
│   ├── App.tsx
│   ├── components/Layout.tsx
│   ├── contexts/TasksContext.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Inbox.tsx
│   │   ├── Tasks.tsx
│   │   └── Calendar.tsx
│   ├── services/api.ts
│   └── types/api.ts
└── .env.example
```

## Page behavior

### Home

`Home.tsx` fetches:

- `getDashboardBrief(DEFAULT_DASHBOARD_ROLE, DEFAULT_DASHBOARD_STAFF_ID)`
- `getDashboardFeed(DEFAULT_DASHBOARD_ROLE, DEFAULT_DASHBOARD_STAFF_ID, undefined, undefined, 4)`

It renders:

- the brief summary,
- a schedule preview,
- the to-do preview,
- and urgency reminders.

### Inbox

`Inbox.tsx` is the most important integration page:

- it lists feed items,
- opens event details,
- exposes `handled` / `archive`,
- and contains the current entry point for timetable-oriented actions.

This page now consumes the explicit backend contract:

```json
{
  "assist": {
    "calendar_patch": {
      "should_render": true,
      "patch_type": "meeting",
      "date": "2026-03-16",
      "start_time": "14:00",
      "end_time": "15:00",
      "title": "Mandatory administrative meeting on Monday, March 16 at 2:00 PM"
    }
  }
}
```

### Tasks

`Tasks.tsx` combines:

- backend action-required items,
- and a few extra local mock tasks used to make the board feel alive during the demo.

### Calendar

`Calendar.tsx` currently uses a static seeded timetable and supports manual event creation.

That is exactly what makes it useful for the hackathon:

```text
static teacher timetable
    + dynamic SapientAI event overlay
```

The injected event comes from `assist.calendar_patch`, not from frontend regex guessing.

## Local development

Install dependencies:

```bash
cd frontend
npm install
```

Copy the runtime template:

```bash
cp .env.example .env
```

Run the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build:

```bash
npm run build
```

Type-check:

```bash
npm run lint
```

Run the full local validation loop:

```bash
npm run check
```

## Environment

The local environment surface is intentionally small and centralized.

Copy the template if you want to change runtime behavior locally:

```bash
cd frontend
cp .env.example .env
```

The main toggles are:

```text
VITE_USE_REAL_API=true|false
VITE_API_BASE_URL=https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook
VITE_DASHBOARD_ROLE=teacher
VITE_DASHBOARD_STAFF_ID=staff_1
VITE_REFRESH_INTERVAL_MS=15000
VITE_DEMO_CALENDAR_WEEK_START=2026-03-16
```

Design rule:

```text
real mode -> Sarah Lee / live backend
mock mode -> distinct static prototype data
```

## Vercel-ready deployment

The frontend is now configured so deployment to Vercel is straightforward:

```text
- Vite app
- all runtime switches exposed through VITE_*
- SPA rewrite handled by vercel.json
```

Relevant files:

- [package.json](package.json)
- [vite.config.ts](vite.config.ts)
- [vercel.json](vercel.json)
- [.env.example](.env.example)

Recommended Vercel setup:

```text
Framework preset: Vite
Root directory: frontend
Build command: npm run build
Output directory: dist
Install command: npm install
```

Required environment variables on Vercel:

```text
VITE_USE_REAL_API=true
VITE_DEBUG_LIVE_EVENTS=false
VITE_API_BASE_URL=https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook
VITE_DASHBOARD_ROLE=teacher
VITE_DASHBOARD_STAFF_ID=staff_1
VITE_REFRESH_INTERVAL_MS=15000
VITE_DEMO_CALENDAR_WEEK_START=2026-03-16
```

Recommended first deployment flow:

```text
1. Import the repository into Vercel
2. Set root directory = frontend
3. Keep framework preset = Vite
4. Add the VITE_* environment variables above
5. Deploy
```

Recommended production sanity check after deploy:

```text
Home     -> loads Sarah Lee live briefing
Inbox    -> shows live event feed for staff_1
Calendar -> shows static timetable and validated overlays
```

## Demo scenarios currently targeted

The backend has been shaped around two explicit demo stories:

### 1. Parent absence message

Manual run in backend:

```text
insight — Ingestion v1.0
-> Run msg_json_record
```

Expected UI effect:

```text
a new standard inbox card appears for staff_1
```

### 2. Administrative meeting email

Manual run in backend:

```text
insight — Ingestion v1.0
-> Run email_json_record
```

Expected UI effect:

```text
a new event appears for staff_1
and the frontend renders it as a timetable event
through assist.calendar_patch
```

### 3. Live WhatsApp scheduling message

Live scenario:

```text
sender alias = kπx-labs
resolved sender = David Brown (admin)
target staff   = Sarah Lee (inferred from bounded staff candidates)
student        = Tim Doe
slot           = Tuesday, March 17, 2026 from 4:00 PM to 5:00 PM
room           = Guidance Room B12
```

Expected UI effect:

```text
a scheduling dialog appears
the proposed patch can be validated or edited
the validated event then appears in Home and Calendar
```

## Current frontend state

The frontend now:

- centralizes runtime constants in `src/config/runtime.ts`
- keeps a separate mock mode when `USE_REAL_API=false`
- refreshes the live backend regularly
- computes the Wellbeing index from fetched backend-driven workload
- opens the calendar around the injected backend meeting event
- consumes `assist.calendar_patch` explicitly in Inbox and Calendar
- surfaces non-time live events through a top-right toast
- surfaces time events through a single global scheduling dialog
- applies validated timetable patches locally so Home and Calendar stay synchronized

The main remaining frontend work is product polish, not contract plumbing.
