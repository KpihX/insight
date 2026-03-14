# insight — School Communication Hub

> **0 Trust — 100% Control | 0 Magic — 100% Transparency | 0 Hardcoding — 100% Flexibility**

`insight` is the **backend** of our hackathon project, built during the Hi! PARIS × IPAI hackathon in March 2026.

The visible frontend prototype can be explored here:

```text
https://ai.studio/apps/73b2468e-784e-4860-ace1-e8bedf93a0b0?fullscreenApplet=true
```

The split is intentional:

```text
visible product surface
-> frontend prototype

operational ingestion + storage + API layer
-> insight backend
```

`insight` does not try to replace every school channel. It sits above them, converts incoming communication into a shared event model, classifies each event with an LLM, stores the result in MongoDB, and exposes the backend APIs consumed by the frontend layer.

---

## 1. Problem First

Schools do not suffer from a lack of messaging channels. They suffer from a lack of shared structure.

```text
email inboxes          WhatsApp groups          school portal notices
      \                      |                        /
       \                     |                       /
        \                    |                      /
         -> fragmented operational signals -> manual triage -> missed context
```

The same absence can appear as:

- a parent WhatsApp message,
- an email to the secretariat,
- a portal update,
- and an informal staff relay.

Without a shared model, every stakeholder re-triages the same thing.

`insight` solves the classification and visibility layer:

```text
incoming source
    -> normalized event
    -> enriched with staff/family context
    -> AI classification
    -> stored event record
    -> dashboard API
```

---

## 2. What Is In Scope

This repository contains the runnable and documented hackathon stack:

- the **n8n-first architecture**,
- the **WhatsApp bridge** used to forward real messages into n8n,
- the **manual seed/reset workflows** for a clean demo state,
- the **published Read API** and **Action API**,
- the **local API smoke-test script**,
- the **local copies of all important n8n Code node scripts**,
- the **local Compose stack for MongoDB, Qdrant, and self-hosted n8n**,
- the **workflow blueprints** needed to recreate the setup on another n8n instance.

This repository does **not** contain a separate application server anymore.

It also does **not** contain the final visible frontend itself. That frontend exists as a separate artifact and uses the backend exposed here.

```text
old idea
n8n -> external TypeScript API -> database

final shipped idea
n8n -> model + MongoDB + Qdrant directly
```

The old prototype is preserved in [`archive/legacy-typescript-prototype`](/home/kpihx/Work/AI/HiBrown/insight/archive/legacy-typescript-prototype) for provenance only.

---

## 3. Final Architecture

```text
                 ┌────────────────────────────────────────────┐
                 │                 SOURCES                     │
                 │ IMAP | WhatsApp bridge | school portal      │
                 └────────────────────────────────────────────┘
                                      |
                                      v
                 ┌────────────────────────────────────────────┐
                 │         insight — Ingestion v1.0            │
                 │ normalize -> context merge -> pre-classify  │
                 │ model -> parse -> MongoDB -> Qdrant         │
                 └────────────────────────────────────────────┘
                                      |
                         ┌────────────┴────────────┐
                         v                         v
            ┌──────────────────────┐   ┌──────────────────────────┐
            │ MongoDB (nextgen)    │   │ Qdrant (semantic memory) │
            │ staff/family/events  │   │ insight_school_events    │
            └──────────────────────┘   └──────────────────────────┘
                         |
                         v
              ┌──────────────────────────────┐
              │ insight — Read API v1.0      │
              │ GET /dashboard/brief         │
              │ GET /dashboard/feed          │
              │ GET /dashboard/event?id=...  │
              └──────────────────────────────┘
                         |
                         v
              ┌──────────────────────────────┐
              │ insight — Action API v1.0    │
              │ POST /dashboard/action       │
              └──────────────────────────────┘
```

---

## 4. Workflow Inventory

### Published workflows

| Workflow | Purpose | Runtime mode |
|----------|---------|--------------|
| `insight — Read API v1.0` | Dashboard read routes | Published / active |
| `insight — Action API v1.0` | Event actions (`handled`, `archive`) | Published / active |

### Manual workflows

| Workflow | Purpose | Why manual |
|----------|---------|------------|
| `insight — Ingestion v1.0` | Real ingestion pipeline + demo input nodes | Hackathon mode: avoids accidental live writes |
| `insight — Demo Seed v1.0` | Seed baseline data | Demo preparation only |
| `insight — Demo Reset v1.0` | Clear baseline data | Demo preparation only |

Full workflow blueprints live in [`n8n/workflows/`](/home/kpihx/Work/AI/HiBrown/insight/n8n/workflows).

---

## 5. Repository Layout

```text
insight/
├── README.md
├── CHANGELOG.md
├── TODO.md
├── docker-compose.yml
├── .env.n8n.example
├── wa-bridge.js
├── scripts/
│   ├── api_smoke_test.sh
│   └── local_deploy_runbook.sh
├── n8n/
│   ├── README.md
│   ├── architecture.md
│   ├── api.md
│   ├── schema_db.md
│   ├── internal.md
│   ├── source.md
│   ├── workflows/
│   ├── nodes/
│   ├── fixtures/
│   └── data/
└── archive/
    ├── legacy-typescript-prototype/
    └── hackathon-pitch-assets/
```

---

## 6. Runtime Components

### 6.1 n8n

The primary runtime used during the hackathon is an online n8n instance:

```text
https://nextgen-n8n.westeurope.cloudapp.azure.com
```

That instance hosts the working workflows and is the reference state reflected in this repository.

### 6.2 MongoDB

Canonical database name:

```text
nextgen
```

Collections:

- `staff_directory`
- `family_directory`
- `school_events`

### 6.3 Qdrant

Canonical collection:

```text
insight_school_events
```

This branch is intentionally future-facing: it stores semantic event documents for a later chatbot or retrieval-based assistant.

### 6.4 WhatsApp bridge

The repository includes [`wa-bridge.js`](/home/kpihx/Work/AI/HiBrown/insight/wa-bridge.js), which uses Baileys and **phone pairing code mode**, not QR mode.

```text
bridge start
   -> request pairing code
   -> phone: Linked Devices
   -> enter code
   -> forward text messages to n8n webhook
```

The bridge stores session state in `wa-auth/`, which is **runtime-only** and intentionally ignored by Git.

### 6.5 Local self-hosting footprint

The repository ships a minimal local stack:

```text
docker compose up -d
  -> MongoDB
  -> Qdrant
  -> n8n
```

This does **not** recreate the cloud instance automatically. It gives you the runtime services so that you can rebuild the workflows locally from the blueprints and node sources stored in this repository.

---

## 7. Demo Operating Procedure

### 7.1 Reset demo state

In n8n:

```text
insight — Demo Reset v1.0
-> run "Reset demo data"
```

### 7.2 Seed demo state

In n8n:

```text
insight — Demo Seed v1.0
-> run "Seed Demo Data"
```

The seed is idempotent:

- `staff_directory` uses `staff_id`
- `family_directory` uses `family_id`
- `school_events` uses `original_id`

### 7.3 Test the published API locally

Run:

```bash
cd /home/kpihx/Work/AI/HiBrown/insight
./scripts/api_smoke_test.sh
```

Expected result:

```text
Passed: 9
Failed: 0
```

### 7.4 Manual curl examples

```bash
curl -sS 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard/brief?role=teacher&staff_id=staff_1' | jq
curl -sS 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard/feed?role=teacher&staff_id=staff_1' | jq
curl -sS 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard/event?id=SEED-EVENT-0001' | jq
curl -sS -X POST 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard/action' \
  -H 'Content-Type: application/json' \
  -d '{"event_id":"SEED-EVENT-0001","action":"handled","actor_id":"staff_1","note":"Handled during demo"}' | jq
```

---

## 8. Local Redeploy on Your Own n8n

The project can be recreated on another n8n instance without guessing, but there are a few moving parts to map explicitly.

### 8.1 Start local services

```bash
cp .env.n8n.example .env.n8n
docker compose up -d
```

The local stack starts:

- `mongo`
- `qdrant`
- `n8n`

### 8.2 Create credentials in n8n

Create these credentials manually in the n8n UI:

1. `MongoDB`
   - connection string should target the local service:
   ```text
   mongodb://mongo:27017
   ```
   - database:
   ```text
   nextgen
   ```

2. `Google AI model credential`
   - host:
   ```text
   https://generativelanguage.googleapis.com
   ```
   - your model API key

3. `QdrantApi account`
   - for the bundled local stack:
   ```text
   http://qdrant:6333
   ```
   - no API key is required for the default local container

4. `IMAP account`
   - optional, only if you want the real IMAP trigger

### 8.3 Import or rebuild workflows

Use the blueprints in:

- [`n8n/workflows/`](/home/kpihx/Work/AI/HiBrown/insight/n8n/workflows)
- [`n8n/nodes/`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes)

The repository stores the important Code node scripts locally so that each workflow can be recreated without reverse-engineering the online instance.

### 8.4 Configure the bridge

Copy and edit:

```bash
cp .env.n8n.example .env.n8n
```

Then set:

- `N8N_TARGET=local`
- `WEBHOOK_URL_LOCAL=http://localhost:5678`
- `N8N_WA_MODE=production` or `test`
- `WA_PHONE=<your phone>`

Start the bridge:

```bash
npm install
npm run start:wa-bridge
```

### 8.5 Seed and test

In local n8n:

```text
Run "Reset demo data"
Run "Seed Demo Data"
```

Then:

```bash
./scripts/api_smoke_test.sh
```

---

## 9. Documentation Map

| File | Role |
|------|------|
| [`n8n/README.md`](/home/kpihx/Work/AI/HiBrown/insight/n8n/README.md) | n8n-focused entry point |
| [`n8n/architecture.md`](/home/kpihx/Work/AI/HiBrown/insight/n8n/architecture.md) | end-to-end pipeline map |
| [`n8n/api.md`](/home/kpihx/Work/AI/HiBrown/insight/n8n/api.md) | published API contract |
| [`n8n/schema_db.md`](/home/kpihx/Work/AI/HiBrown/insight/n8n/schema_db.md) | MongoDB schema |
| [`n8n/source.md`](/home/kpihx/Work/AI/HiBrown/insight/n8n/source.md) | connectors, demo inputs, WhatsApp specifics |
| [`n8n/internal.md`](/home/kpihx/Work/AI/HiBrown/insight/n8n/internal.md) | workflow inventory and operational notes |

---

## 10. Security and Git Hygiene

Ignored from Git:

- `.agent/`
- local agent symlink files
- `wa-auth/`
- `.env`
- `.env.n8n`
- local n8n and MongoDB volumes

That keeps the repository publishable without shipping collaboration traces, secrets, or WhatsApp session state.

---

## 11. Current Status

The current validated state is:

```text
Reset -> Seed -> Read API -> Action API -> Read again
```

with:

```text
API smoke test
Passed: 9
Failed: 0
```

That is the baseline intended for the GitHub handoff.

Keep the product boundary explicit in any presentation or README excerpt:

```text
visible frontend prototype
-> https://ai.studio/apps/73b2468e-784e-4860-ace1-e8bedf93a0b0?fullscreenApplet=true

this repository
-> insight backend
```
