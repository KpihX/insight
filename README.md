# insight

> **lightweight by design**

`insight` is now organized as a small monorepo with two explicit parts:

```text
frontend/ -> the visible teacher-facing product surface
backend/  -> the n8n-first ingestion, storage, and API layer
```

The current frontend source of truth lives directly in this repository under `frontend/`.

That split is intentional:

```text
teacher experience and visual demo
-> frontend/

communication ingestion + classification + persistence + APIs
-> backend/
```

## Repository map

```text
insight/
├── README.md
├── frontend/
├── backend/
└── archive/
```

## Where to start

- [README.md](/home/kpihx/Work/AI/HiBrown/insight/README.md) — monorepo overview and documentation map
- [frontend/README.md](/home/kpihx/Work/AI/HiBrown/insight/frontend/README.md) — UI structure, local development, current API wiring, and demo behavior
- [backend/README.md](/home/kpihx/Work/AI/HiBrown/insight/backend/README.md) — n8n runtime, published API, WhatsApp bridge, demo workflows, and local redeploy instructions
- [CHANGELOG.md](/home/kpihx/Work/AI/HiBrown/insight/CHANGELOG.md) — project evolution log
- [TODO.md](/home/kpihx/Work/AI/HiBrown/insight/TODO.md) — current roadmap

## Project posture

The frontend and backend are intentionally decoupled:

```text
frontend refresh
-> calls published backend routes

backend
-> remains the canonical ingestion + event system
```

The backend is documented as the source of truth for:

- event ingestion,
- demo seeds and reset,
- the dashboard read API,
- the action API,
- the WhatsApp bridge runtime,
- and the local reconstruction instructions for another n8n instance.

## Current demo posture

The repository is currently aligned around one concrete live flow:

```text
WhatsApp admin message
-> n8n ingestion
-> bounded receiver inference
-> explicit calendar_patch
-> frontend scheduling dialog
-> validated overlay in Home + Calendar
```

The frontend is also ready for a first static deployment on Vercel, while the backend remains hosted through the published n8n endpoints.

## Archive note

`archive/` keeps provenance material only:

- old prototype traces,
- pitch assets,
- and temporary artifacts that should not define the current runtime.

For implementation work, always start in `frontend/` or `backend/`.
