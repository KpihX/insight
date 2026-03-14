# CHANGELOG

## [0.4.0] - 2026-03-13
- [x] Architecture pivot: n8n-first. All AI logic lives in n8n Code nodes (JS). No external API server. [CLAUDE]
- [x] Deleted obsolete artifacts: `api.py`, `Dockerfile`, `src/` (TypeScript), `tsconfig.json`, `normalizers/` (Python). [CLAUDE]
- [x] `package.json`: removed TypeScript/tsx deps, simplified scripts to `node wa-bridge.js` only. [CLAUDE]
- [x] `docker-compose.yml`: removed `insight-api` service — n8n is the only container. [CLAUDE]
- [x] Created `n8n/nodes/`: version-controlled JS sources for all Code nodes (normalize-email, normalize-wa, gemini-classify). [CLAUDE]
- [x] Created `n8n/fixtures/`: 7 JSON files documenting exact data shape at each pipeline stage (00–05). [CLAUDE]
- [x] Created `n8n/README.md`: pipeline map, fixture index, schema, variable table, new-source guide. [CLAUDE]
- [x] Deployed complete 8-node n8n workflow via n8n-mcp (workflow ID: yBh4AiGZZCMmHTIg). [CLAUDE]
- [x] wa-bridge.js: WhatsApp → n8n bridge using Baileys + phone pairing + fetchLatestBaileysVersion(). [CLAUDE]

## [0.3.0] - 2026-03-13
- [x] TypeScript migration — replaced Python scaffold with full TS project. [CLAUDE]
- [x] Added `package.json`, `tsconfig.json` (Node16/ESM, strict, TS 5.7). [CLAUDE]
- [x] Added `.gitignore` (node_modules, dist, .env). [CLAUDE]
- [x] Created domain type system: `src/types.ts` (SchoolMessage, Classification, DashboardView). [CLAUDE]
- [x] Created config loader: `src/config.ts` (dotenv + typed settings, Gemini model config). [CLAUDE]
- [x] Created classification pipeline: `src/classifier.ts` (Gemini 2.5 Flash, structured prompt, strict JSON parser). [CLAUDE]
- [x] Created entry point: `src/index.ts` (3-message smoke-test). [CLAUDE]
- [x] Created secrets template: `src/.env.example`. [CLAUDE]
- [x] Updated README.md quickstart for TypeScript. [CLAUDE]
- [x] Removed Python artifacts (`pyproject.toml`, `__init__.py`, `.python-version`). [CLAUDE]

## [0.2.0] - 2026-03-13
- [x] Full domain-aware reinit — school ecosystem context replaces generic framing. [CLAUDE]
- [x] `.agent/AGENT.md` — `## PROJECT` section rewritten with school domain, stakeholder model, team, deliverables, eval criteria, timeline, tech stack, mentors, jurors.
- [x] `README.md` — complete rewrite: verbose, illustrated, stakeholder model, sprint timeline.
- [x] `TODO.md` — restructured as sprint backlog (Phase 1 Design / Phase 2 Build / Phase 3 Ship).
- [x] `CHANGELOG.md` — updated with v0.2.0 reinit entry.

## [0.1.0] - 2026-03-13
- [x] Initialized project repository (`git init`). [CODEX]
- [x] Bootstrapped Python package using `uv init --package`. [CODEX]
- [x] Added local collaboration kernel at `.agent/AGENT.md`. [CODEX]
- [x] Added `GEMINI.md` and `CLAUDE.md` symlinks to `.agent/AGENT.md`. [CODEX]
- [x] Added project-level `README.md`, `TODO.md`, and `CHANGELOG.md`. [CODEX]
- [x] Captured Challenge 2 high-level framing from hackathon opening deck. [CODEX]
