# insight

> **0 Trust — 100% Control | 0 Magic — 100% Transparency | 0 Hardcoding — 100% Flexibility**

`insight` is now organized as a small monorepo with two explicit parts:

```text
frontend/ -> the visible teacher-facing product surface
backend/  -> the n8n-first ingestion, storage, and API layer
```

The current visible frontend prototype is available here:

```text
https://ai.studio/apps/73b2468e-784e-4860-ace1-e8bedf93a0b0?fullscreenApplet=true
```

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

## Archive note

`archive/` keeps provenance material only:

- old prototype traces,
- pitch assets,
- and temporary artifacts that should not define the current runtime.

For implementation work, always start in `frontend/` or `backend/`.
