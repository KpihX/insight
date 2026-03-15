# insight backend ⚙️

> `insight` backend is the n8n-first operational layer of the project.

It ingests fragmented school communication, classifies it into a shared event model, stores canonical event records, and exposes the API consumed by the frontend.

```text
incoming source
    -> normalized event
    -> context enrichment
    -> LLM classification
    -> MongoDB persistence
    -> dashboard APIs
```

The visible frontend that consumes this backend is documented separately:

- [README.md](../README.md)
- [frontend/README.md](../frontend/README.md)

Public naming note:

```text
frontend product brand -> SapientAI
backend runtime name   -> insight
```

That split is intentional so the user-facing brand can evolve without breaking n8n workflow names, storage keys, or published backend contracts.

## What lives here 🗂️

```text
backend/
├── README.md
├── package.json
├── docker-compose.yml
├── .env.n8n.example
├── wa-bridge.js
├── wa-auth/                  # runtime state, Git-ignored
├── scripts/
└── n8n/
```

## Runtime split 🌐

### Published workflows

- `insight — Read API v1.0`
- `insight — Action API v1.0`

### Manual workflows

- `insight — Ingestion v1.0`
- `insight — Demo Seed v1.0`
- `insight — Demo Reset v1.0`

That split is intentional for hackathon safety:

```text
published
-> safe read/write API routes for the frontend

manual
-> live ingestion and demo preparation, triggered on demand
```

## Backend responsibilities 🏛️

The backend owns:

- IMAP / WhatsApp / webhook ingestion,
- LLM-backed event classification,
- MongoDB event storage,
- Qdrant semantic storage,
- read APIs for dashboard views,
- action APIs for `handled` and `archive`,
- demo reset and seed workflows,
- and the WhatsApp relay runtime.

## API surface 🔌

Base URL:

```text
https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook
```

Published routes:

```text
GET  /dashboard/brief
GET  /dashboard/feed
GET  /dashboard/event?id=...
POST /dashboard/action
```

The detailed contract, including `assist.calendar_patch`, is documented in:

- [n8n/api.md](n8n/api.md)

## WhatsApp bridge

The bridge entrypoint is:

- [wa-bridge.js](wa-bridge.js)

It uses Baileys and stores runtime auth state in:

```text
backend/wa-auth/
```

Important behavior:

```text
start bridge
   -> request pairing code
   -> phone: Linked Devices
   -> enter pairing code
   -> bridge forwards inbound messages to n8n
```

This repository documents the flow and ships the runtime code, but the auth state itself is local-only and must never be committed.

## Local reconstruction

### 1. Infrastructure

Bring up the local dependencies:

```bash
cd backend
docker compose up -d
```

This starts:

- MongoDB
- Qdrant
- n8n

### 2. n8n environment

Create a local environment file from the template:

```bash
cp .env.n8n.example .env.n8n
```

Then adjust the values for your machine and credentials.

At minimum, review:

- MongoDB connection details
- Qdrant connection details
- n8n host/base URL
- model credentials used by the classification step
- webhook endpoints used by the WhatsApp bridge

### 3. Workflow reconstruction

The repository does not ship raw n8n export JSON files yet. Instead, it ships:

- workflow blueprints,
- local copies of key Code node scripts,
- demo fixtures,
- seed data,
- API contracts,
- and architectural notes.

Start here:

- [n8n/README.md](n8n/README.md)
- [n8n/workflows/README.md](n8n/workflows/README.md)
- [n8n/nodes/README.md](n8n/nodes/README.md)

## Demo operations

### Reset demo state

In n8n:

```text
insight — Demo Reset v1.0
-> run "Reset demo data"
```

### Seed demo state

In n8n:

```text
insight — Demo Seed v1.0
-> run "Seed Demo Data"
```

### Smoke-test the published API

```bash
cd backend
./scripts/api_smoke_test.sh
```

The target state is:

```text
Passed: 9
Failed: 0
```

## Current live demo path

The strongest end-to-end demo path is now:

```text
WhatsApp sender alias kπx-labs
-> resolved as David Brown (admin)
-> message names Sarah Lee explicitly
-> Gemini returns inferred_receivers + calendar_patch
-> Parse Classified Event writes final receivers + assist.calendar_patch
-> frontend opens the scheduling dialog for staff_1
```

## Backend documentation map

- [n8n/architecture.md](n8n/architecture.md) — end-to-end pipeline
- [n8n/api.md](n8n/api.md) — published API contract
- [n8n/schema_db.md](n8n/schema_db.md) — MongoDB model
- [n8n/source.md](n8n/source.md) — input channels and demo inputs
- [n8n/internal.md](n8n/internal.md) — operational notes and workflow inventory
- [CHANGELOG.md](../CHANGELOG.md) — project evolution log
- [TODO.md](../TODO.md) — project roadmap and pending work
