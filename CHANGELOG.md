# CHANGELOG

## [1.3.0] - 2026-03-15
- [x] Added a stable global scheduling dialog for live time events and propagated validated timetable patches to both Home and Calendar. [CODEX]
- [x] Added a global non-time live toast and tuned its position and duration for hackathon visibility. [CODEX]
- [x] Fixed the frontend live-event polling loop so the dialog trigger no longer cancels its own detail fetches before completion. [CODEX]
- [x] Extended demo identity mapping: Sarah Lee now includes `nextgenproject373@gmail.com`, David Brown now includes `kapoivha@gmail.com`, and `kπx-labs` is recognized as an admin alias. [CODEX]
- [x] Upgraded the ingestion workflow so direct WhatsApp messages without explicit receivers can infer canonical staff targets through `inferred_receivers`, while keeping `receivers` as the only final stored contract. [CODEX]
- [x] Aligned the live demo story around a WhatsApp scheduling message for Tim Doe and documented the Vercel deployment path for the frontend. [CODEX]

## [1.2.0] - 2026-03-14
- [x] Added a dedicated frontend runtime config so live/mock API mode, backend base URL, polling interval, and demo calendar focus can be changed without code spelunking. [ARCHIVE]
- [x] Aligned the imported frontend with the explicit backend `assist.calendar_patch` contract in both types and UI flows. [ARCHIVE]
- [x] Reworked the calendar handoff so Inbox and Home can open the static timetable around the backend-provided meeting event instead of relying on text heuristics. [ARCHIVE]
- [x] Made the Home and Tasks wellbeing widgets dynamic from fetched workload, urgent items, and deadline pressure. [ARCHIVE]
- [x] Preserved a deliberately different static mock mode when `USE_REAL_API=false` so reviewers can visually distinguish mock data from the live Sarah Lee demo. [ARCHIVE]

## [1.1.0] - 2026-03-14
- [x] Restructured the repository into a clean monorepo layout with `frontend/` and `backend/` as first-class directories. [ARCHIVE]
- [x] Imported the local frontend codebase into `frontend/` and documented its current screens, API wiring, and demo posture. [ARCHIVE]
- [x] Moved the WhatsApp bridge runtime and auth state under `backend/` so the backend concerns live together. [ARCHIVE]
- [x] Removed temporary handoff clutter from the root, including `insight.zip` and the stale root `node_modules/`. [ARCHIVE]
- [x] Rewrote the repository documentation into three layers: root overview, frontend README, and backend README. [ARCHIVE]
- [x] Realigned the backend n8n documentation after the monorepo move so all internal links point to the new `backend/n8n/` structure. [ARCHIVE]
- [x] Kept the published API contract explicit, including `assist.calendar_patch`, so the frontend does not need to infer timetable behavior heuristically. [ARCHIVE]

## [1.0.0] - 2026-03-14
- [x] Repository refactor for GitHub handoff: removed the outdated TypeScript-first narrative from the main docs and realigned the project around the shipped n8n-first architecture. [ARCHIVE]
- [x] Archived the original hackathon pitch assets under `archive/hackathon-pitch-assets/` to keep the runtime repository focused on the product. [ARCHIVE]
- [x] Added local workflow blueprints and local copies of the important n8n Code node scripts to make the system reproducible on another n8n instance. [ARCHIVE]
- [x] Added local mirrors for previously inline-only workflow logic: pack nodes, demo input nodes, seed event generator, and Qdrant document payload. [ARCHIVE]
- [x] Updated `.gitignore` to exclude local traces, runtime auth state, local env files, and runtime volumes. [ARCHIVE]
- [x] Realigned local deployment guidance around `docker-compose.yml`, `.env.n8n.example`, and the final online/offline n8n setup. [ARCHIVE]
- [x] Extended the self-hosted local stack to include Qdrant so the semantic branch can be recreated without extra infrastructure work. [ARCHIVE]
- [x] Documented the final API contract: `GET /dashboard/brief`, `GET /dashboard/feed`, `GET /dashboard/event?id=...`, `POST /dashboard/action`. [ARCHIVE]
- [x] Documented the WhatsApp bridge pairing-code flow and runtime session behavior. [ARCHIVE]

## [0.4.0] - 2026-03-13
- [x] Architecture pivot: n8n-first. All AI logic lives in n8n Code nodes. No external application server remains in the runtime path. [ARCHIVE]
- [x] Simplified the backend runtime so the local Node process only serves the WhatsApp bridge. [ARCHIVE]
- [x] Added version-controlled n8n fixtures and initial local Code node exports. [ARCHIVE]
- [x] Added the first WhatsApp-to-n8n bridge based on Baileys pairing flow. [ARCHIVE]

## [0.3.0] - 2026-03-13
- [x] Temporary TypeScript migration prototype created during the hackathon exploration phase. [ARCHIVE]

## [0.2.0] - 2026-03-13
- [x] Project reframing around the school communication problem space, the hackathon challenge, and the first stakeholder model. [ARCHIVE]

## [0.1.0] - 2026-03-13
- [x] Repository initialized with project-level documentation and local setup. [ARCHIVE]
