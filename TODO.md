# TODO — insight Sprint

> **Deadline: Sunday March 15, 2026 · 11:30 AM (submission) · 1:00 PM (pitch)**

---

## ✅ Done — v0.1.0 (Codex Init, 2026-03-13)
- [x] Initialize repository with `git init`
- [x] Bootstrap Python package with `uv init --package`
- [x] Add `.agent/AGENT.md` and cross-agent symlinks (`CLAUDE.md`, `GEMINI.md`)
- [x] Add initial project documentation skeleton

## ✅ Done — v0.3.0 (TypeScript Migration, 2026-03-13)
- [x] Migrate from Python to TypeScript (Node 20, ESM, strict)
- [x] `package.json` + `tsconfig.json` bootstrapped
- [x] Domain type system: `SchoolMessage`, `Classification`, `DashboardView`
- [x] Gemini classification pipeline: `src/classifier.ts`
- [x] Config loader with dotenv: `src/config.ts`
- [x] Entry point smoke-test: `src/index.ts` (3 school message examples)
- [x] Secrets template: `src/.env.example`
- [ ] **Run `npm install`** to materialize `node_modules/`
- [ ] **Add Gemini API key** to `src/.env`

## ✅ Done — v0.2.0 (Claude Reinit, 2026-03-13)
- [x] Full domain-aware reinit: school ecosystem context, team, deliverables, eval criteria
- [x] Rewrite `README.md` — verbose, stakeholder model, sprint timeline, domain taxonomy
- [x] Rewrite `TODO.md` — sprint-phased backlog
- [x] Update `CHANGELOG.md` and `.agent/AGENT.md` — full project section

---

## 🔥 Phase 0 — Immediate Setup (Friday morning)
- [ ] Choose a team name
- [ ] Set up Gmail account for Google AI environment access
- [ ] Set up Discord — join IPAI Hackathon server, find `#ask-a-mentor`
- [ ] Contact Katrin Feierling-Sülzle (teacher mentor) — validate 3 trigger scenarios

## 🔥 Phase 1 — Design (Friday Mar 13)

### Team & Domain
- [ ] Meet all team members (Ali, Arian, Mehryar, Tizian, Augustin, Nina) — Floor 3
- [ ] Run Design Thinking output: define 3 user journeys per stakeholder role
  - [ ] Journey A: Teacher sends urgent notice to parents
  - [ ] Journey B: Parent receives & acknowledges permission slip
  - [ ] Journey C: Secretariat routes an administrative document
- [ ] Contact mentor Katrin Feierling-Sülzle (teacher) — validate domain assumptions early

### Architecture (decided ✅)
- [x] Stack: n8n (orchestration) + TypeScript HTTP API (AI logic) + Docker Compose
- [x] Scope: 3 operational triggers — absence_report · form_deadline · admin_notice
- [x] No real dataset needed — generate 30 synthetic events with Gemini

### Dataset Generation (FIRST TASK)
- [ ] Generate 10 × absence_report JSON events with Gemini
- [ ] Generate 10 × form_deadline JSON events with Gemini
- [ ] Generate 10 × admin_notice JSON events with Gemini
- [ ] Store in `data/events/{absence,forms,notices}/`

### n8n Setup
- [ ] `docker compose up` — n8n + insight-api running locally
- [ ] Wire Webhook trigger node (receives JSON event POST)
- [ ] Wire HTTP node → `POST insight-api/classify`
- [ ] Wire Cron node (7:45 AM) → `GET insight-api/morning-brief/:role`
- [ ] Wire Cron node (every 2h) → `GET insight-api/dead-zones`
- [ ] Wire Discord webhook node (notification output)
- [ ] Export workflow JSON → `n8n/workflows/`

### insight-api (TypeScript)
- [ ] Add Express/Hono HTTP server to `src/index.ts`
- [ ] `POST /classify` — takes SchoolEvent → returns Classification
- [ ] `GET /dashboard/:role` — returns role-filtered classified events
- [ ] `GET /dead-zones` — returns unacknowledged urgent items > threshold
- [ ] `POST /nudge` — Gemini generates personalized message for recipient
- [ ] `GET /morning-brief/:role` — Gemini digest for role
- [ ] In-memory state store (Map) — acknowledgment tracking
- [ ] `POST /acknowledge` — marks event as read by role

### Prototyping
- [ ] Set up Google AI Studio + confirm Gemini 2.5 Flash API key works
- [ ] Sketch dashboard wireframe: Teacher / Parent / Secretariat lanes

---

## 🔨 Phase 2 — Build (Saturday Mar 14)
- [ ] Implement Gemini classification pipeline (type + audience + priority)
- [ ] Build ingestion layer (mock JSON data or real Gmail integration)
- [ ] Build dashboard UI — at minimum: teacher view + parent view
- [ ] Wire classification → dashboard (end-to-end data flow working)
- [ ] Handle edge cases: ambiguous messages, multi-audience broadcasts
- [ ] ★ Attend pitching workshop at 4:00 PM (Yue Wu) — mandatory
- [ ] Draft pitch narrative structure: Problem (30s) → Analysis (30s) → Demo (90s) → Impact (30s)
- [ ] Test with realistic school scenarios (permission slip, exam notice, emergency alert)

---

## 🚀 Phase 3 — Ship (Sunday Mar 15)
- [ ] Final polish: UI, edge cases, demo flow
- [ ] Prepare demo script (2–3 concrete school comm examples, live walkthrough)
- [ ] Write **Report / Abstract** (1 page PDF/Word — idea summary + team learnings)
- [ ] Finalize **pitch slides** (problem · analysis · solution · demo · impact)
- [ ] Practice pitch — strict 3:00 minute timing, all team members aligned
- [ ] Push final code to repository
- [ ] ★ **Submit by 11:30 AM** — Report + Repo link + Slides
- [ ] Deliver 3-minute pitch at 1:00 PM

---

## 📌 Open Decisions

- [ ] **Dashboard UI**: simple HTML served by insight-api vs n8n's built-in webhook response view
- [ ] **Dead Zone threshold**: 4h / 12h / 24h — validate with Katrin (teacher)
- [ ] **Live demo input method**: curl POST vs simple HTML form vs Discord slash command
- [ ] **n8n hosting**: local Docker (shared via ngrok) vs IPAI-provided infra
- [ ] **Team name** — needed Friday morning
