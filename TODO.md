# TODO ✅

## Current Baseline 🏛️
- [x] Stabilize the final hackathon API around the working n8n workflows.
- [x] Validate `Reset -> Seed -> Read -> Action -> Read again` with the local smoke-test script.
- [x] Make the repository publishable by excluding secrets, WhatsApp auth state, local agent traces, and temporary transfer artifacts.
- [x] Restructure the repository into a clear `frontend/` + `backend/` monorepo.
- [x] Import the local frontend codebase and document its current runtime assumptions.
- [x] Rewrite the documentation so the root, frontend, and backend each tell the right story.

## Frontend Follow-Up ✨
- [x] Finalize the imported frontend so it consumes the explicit `assist.calendar_patch` contract end to end.
- [x] Replace the current heuristic "Add to calendar" behavior with direct rendering from backend-provided timetable metadata.
- [x] Align `src/types/api.ts` with the final backend contract, including `assist.calendar_patch`.
- [x] Add a centralized frontend runtime config for live/mock API mode, base URL, polling interval, and demo calendar focus.
- [x] Make the Home and Tasks wellbeing cards depend on fetched backend-driven workload instead of fixed demo numbers.
- [x] Re-run `npm install`, `npm run lint`, and `npm run build` on a machine with full npm registry access and commit the refreshed lockfile.
- [x] Add a single global dialog for live time events and keep Home and Calendar synchronized after validation.
- [x] Add a single global toast for live non-time events without duplicating reminders inside Calendar.
- [ ] Reduce or isolate remaining static UI placeholders so reviewers can distinguish live backend data from intentional mock scaffolding.
- [ ] Remove the temporary live debug panel and any leftover debug-only traces once the live demo path is fully locked.
- [ ] Add a lightweight production branding pass for the deployed Vercel build.

## Backend Follow-Up ⚙️
- [ ] Export full n8n workflow JSON snapshots directly from the online instance and store them next to the local blueprints.
- [ ] Add richer history tracking for event lifecycle instead of the current synthetic `history` array.
- [ ] Decide whether the vector branch should remain optional or become part of the default local redeploy.
- [ ] Extend the source layer beyond WhatsApp, IMAP, and a generic portal webhook.
- [x] Add canonical staff aliases and contact mapping for the live Sarah Lee / David Brown demo identities.
- [x] Allow bounded receiver inference for direct WhatsApp messages while preserving `receivers` as the only stored contract.
- [ ] Decide whether receiver inference confidence should become an explicit persisted field for auditability.

## Product Direction 🧭
- [ ] Add acknowledgment tracking semantics beyond `handled` and `archived`.
- [ ] Add role-specific dashboards for parents and secretariat.
- [ ] Introduce retrieval-assisted chat on top of `insight_school_events`.
- [x] Tighten the frontend demo flow so inbox actions and timetable overlays feel fully synchronized.
- [ ] Add a second live scheduling scenario (reschedule / cancellation) beyond the current meeting creation flow.

## Ops Hygiene 🧰
- [ ] Add a release checklist before the repository is tagged publicly.
- [x] Add a credential checklist for self-hosting on a fresh n8n instance.
- [ ] Add a short deploy-and-smoke-test checklist for Vercel + published n8n backend.
