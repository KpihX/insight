# TODO

## Current Baseline
- [x] Stabilize the final hackathon API around the working n8n workflows.
- [x] Validate `Reset -> Seed -> Read -> Action -> Read again` with the local smoke-test script.
- [x] Make the repository publishable by excluding secrets, WhatsApp auth state, and local agent traces.
- [x] Rewrite the documentation to reflect the actual shipped architecture.

## Short-Term Follow-Up
- [ ] Export full n8n workflow JSON snapshots directly from the online instance and store them next to the local blueprints.
- [ ] Add a small frontend shell that consumes the published Read API and Action API.
- [ ] Add richer history tracking for event lifecycle instead of the current synthetic `history` array.
- [ ] Decide whether the vector branch should remain optional or become part of the default local redeploy.
- [ ] Add a read-only HTML dashboard outside n8n for judges who prefer a dedicated frontend view.

## Product Direction
- [ ] Extend the source layer beyond WhatsApp, IMAP, and a generic portal webhook.
- [ ] Add acknowledgment tracking semantics beyond `handled` and `archived`.
- [ ] Add role-specific dashboards for parents and secretariat.
- [ ] Introduce retrieval-assisted chat on top of `insight_school_events`.

## Ops Hygiene
- [ ] Add a release checklist before the repository is tagged publicly.
- [x] Add a credential checklist for self-hosting on a fresh n8n instance.
