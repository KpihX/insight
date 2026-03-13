# TODO — insight Sprint

> **Deadline: Sunday March 15, 2026 · 11:30 AM (submission) · 1:00 PM (pitch)**

---

## ✅ Done — v0.1.0 (Codex Init, 2026-03-13)
- [x] Initialize repository with `git init`
- [x] Bootstrap Python package with `uv init --package`
- [x] Add `.agent/AGENT.md` and cross-agent symlinks (`CLAUDE.md`, `GEMINI.md`)
- [x] Add initial project documentation skeleton

## ✅ Done — v0.2.0 (Claude Reinit, 2026-03-13)
- [x] Full domain-aware reinit: school ecosystem context, team, deliverables, eval criteria
- [x] Rewrite `README.md` — verbose, stakeholder model, sprint timeline, domain taxonomy
- [x] Rewrite `TODO.md` — sprint-phased backlog
- [x] Update `CHANGELOG.md` and `.agent/AGENT.md` — full project section

---

## 🔥 Phase 1 — Design (Friday Mar 13)

### Team & Domain
- [ ] Meet all team members (Ali, Arian, Mehryar, Tizian, Augustin, Nina) — Floor 3
- [ ] Run Design Thinking output: define 3 user journeys per stakeholder role
  - [ ] Journey A: Teacher sends urgent notice to parents
  - [ ] Journey B: Parent receives & acknowledges permission slip
  - [ ] Journey C: Secretariat routes an administrative document
- [ ] Contact mentor Katrin Feierling-Sülzle (teacher) — validate domain assumptions early

### Architecture Decision (BLOCKING)
- [ ] Choose runtime: **AppScript** (Google Workspace native) vs **Python** (Gemini API + web UI)
  - AppScript: deeper Gmail/Calendar/Drive integration, demo-friendly for judges
  - Python: more control, aligned with KpihX stack, richer classification pipeline
- [ ] Define MVP scope — what is strictly IN vs OUT for 46h sprint

### Classification Design
- [ ] Define classification taxonomy:
  - Type labels: `[urgent, informational, action-required, event]`
  - Audience labels: `[student, parent, teacher, secretariat, all]`
  - Priority: `[high, medium, low]`
- [ ] Identify 10–15 realistic school communication examples (seed dataset for testing)

### Prototyping
- [ ] Set up Google AI Studio account + test Gemini 2.5 Flash on classification prompt
- [ ] Sketch dashboard wireframe (paper or digital): role-based view, priority lane, filters

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

## 📌 Open Architectural Decisions

- [ ] **Runtime**: AppScript vs Python — decide in Phase 1 (blocks everything)
- [ ] **Classification granularity**: binary (urgent/not-urgent) vs full 4-type taxonomy
- [ ] **Multi-role dashboard**: single app with role-based views vs separate lightweight views
- [ ] **Data source**: mock/synthetic school data vs real Gmail API integration
