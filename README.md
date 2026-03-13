# insight — School Communication Hub

> **0 Trust — 100% Control | 0 Magic — 100% Transparency | 0 Hardcoding — 100% Flexibility**

Hackathon project — **Team 7** · **Challenge 2: Clean Communication**
IPAI Foundation × Hi! PARIS · Heilbronn, Germany · March 13–15, 2026

---

## 🏫 Problem First: Why School Communication Is Broken

Schools operate at the intersection of multiple stakeholder groups — students, parents, teachers,
and secretariat — each generating and receiving communication through radically different channels.
The result is a fragmented, high-friction communication landscape that causes **information loss**,
**coordination failures**, and **daily stress** for all parties.

```
SCHOOL COMMUNICATION FRAGMENTATION (measured)
────────────────────────────────────────────────────────────────
CATEGORY             VOLUME    BREAKDOWN
────────────────────────────────────────────────────────────────
Digital Comm          47.4%    Mails (35) · Short Chats (20)
                               Internal Mail (15) · Notifications (5)

Written & Physical    28.5%    Letters (25) · Mail (10)
                               Information Sheets (10)

School Operations     24.1%    Calendar Data (15) · Forms (10)
                               Administrative Notices (13)

Roles & Protocols     12.7%    Parents (8) · Schoolchildren (5)
                               Teachers (5) · Secretariat (2)
                               Notification Protocols (8)
────────────────────────────────────────────────────────────────
Total items mapped: 158 across 4 stakeholder roles
```

The school ecosystem is not a company Slack workspace. It is a **multi-role, multi-channel,
high-stakes coordination space** where a missed notification can mean a missed permission slip,
a misrouted urgent message, or a parent left uninformed about a critical event.

### The Root Cause — It Is Not "Too Many Apps"

```
SYMPTOM:  "We have email, WhatsApp, paper forms, a school portal, and SMS"
                              ↓
ROOT CAUSE: No shared model of what communication belongs where,
            for whom, at what urgency level.
                              ↓
INSIGHT:  The classification problem IS the core problem.
          Solve classification → you can route, prioritize, and surface.
```

### Why Existing Tools Fail

- Teachers waste time triaging non-urgent messages alongside urgent ones
- Parents receive physical letters, emails, and app notifications with no unified view
- Secretariat manages 4 different communication categories with no single source of truth
- Students receive information through fragmented channels they rarely check

---

## 🎯 Goal & Expected Outcome

**Goal:** Build a **central, intelligent dashboard** that bundles school messages, appointments,
and tasks for all stakeholder roles — with AI-powered classification as the core spine.

**Outcome:**
1. **Fitting document classification** — each incoming communication is typed, tagged, and routed
2. **Intuitive interface** — low-friction UX accessible to teachers, parents, secretariat, students

---

## 🧩 Domain Model: Stakeholders × Communication

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SCHOOL COMMUNICATION ECOSYSTEM                   │
├───────────────┬───────────────┬──────────────────┬──────────────────┤
│   STUDENT     │    PARENT     │    TEACHER       │   SECRETARIAT    │
│               │               │                  │                  │
│  receives:    │  receives &   │  sends &         │  orchestrates:   │
│  homework     │  signs forms  │  receives        │  admin notices   │
│  events       │  stays aware  │  manages class   │  calendar        │
│  reminders    │  of events    │  communication   │  forms routing   │
└───────────────┴───────────────┴──────────────────┴──────────────────┘
        │                │               │                  │
        └────────────────┴───────────────┴──────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │    AI CLASSIFICATION ENGINE      │
                    │        (Gemini 2.5 Flash)        │
                    │                                  │
                    │  Type:     urgent / info /       │
                    │            action-required /     │
                    │            event                 │
                    │                                  │
                    │  Audience: student / parent /    │
                    │            teacher / secretariat │
                    │                                  │
                    │  Priority: high / medium / low   │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │        UNIFIED DASHBOARD         │
                    │                                  │
                    │  Priority lane · Role view       │
                    │  Alerts · Calendar · Archive     │
                    └──────────────────────────────────┘
```

---

## 🏆 Evaluation Criteria (Judging Grid)

Every architectural and UX decision must be validated against these 4 criteria:

| Criterion | Jury Question | Our Angle |
|-----------|---------------|-----------|
| **Challenge Fit** | Does the solution address the core school comm problem? | School-specific taxonomy, multi-role routing |
| **Originality** | How creative/innovative is the idea? | Role-aware AI classification for school domain |
| **Technical Implementation** | How well is it built? | Gemini pipeline + clean role-based UI |
| **Pitch Performance** | How clearly was it presented? | 3-min narrative: problem → demo → impact |

---

## 👥 Team 7

| Name | Institution |
|------|-------------|
| Ali | — |
| Arian | — |
| Mehryar | — |
| Tizian | — |
| Augustin | — |
| **Ivann (KπX)** | École Polytechnique (l'X) · System Architect |
| Nina | — |

- **Challenge 2: Clean Communication** · **Floor 3**
- Guided by Anita & Lucia to the workspace

---

## 📦 Deliverables

| # | Deliverable | Format | Constraint | Deadline |
|---|-------------|--------|------------|----------|
| 1 | **Report / Abstract** | PDF or Word | 1 page max | Sun Mar 15 · 11:30 AM |
| 2 | **Technical Solution** | AppScript / Python / repo | Functional implementation | Sun Mar 15 · 11:30 AM |
| 3 | **Pitch Presentation** | Slides | 3 minutes per team | Sun Mar 15 · 1:00 PM |

---

## ⏱️ Sprint Timeline

```
FRI  Mar 13   ↓ STARTED
  12:30 PM  Hacking & Mentoring
   7:00 PM  Dinner
   7:00 PM+ Late Night Hacking

SAT  Mar 14
   9:00 AM  Hacking & Mentoring
  12:00 PM  Lunch
   4:00 PM  ★ Pitching Workshop — "How to present in 3 min" (Yue Wu)
   4:30 PM  Hacking & Mentoring
   7:00 PM+ Late Night Hacking

SUN  Mar 15
   9:00 AM  Hacking & Pitch Prep
  11:30 AM  ★★ SUBMISSION DEADLINE ★★
  12:00 PM  Lunch
   1:00 PM  Pitches (3 min/team)
   2:30 PM  Award Ceremony
   3:30 PM  End
```

---

## 🛠️ Tech Stack

- **AI Engine:** Google AI Studio · Gemini 2.5 Flash Preview (official hackathon platform)
- **Primary Language:** Python 3.12+ (managed via `uv`)
- **Accepted deliverable formats:** AppScript, Python, or GitHub repo link
- **Communication:** Discord — IPAI Hackathon server (`#ask-a-mentor`, `#community-hub`, `#ask-an-organizer`)

---

## 🧑‍🏫 Key People

**Mentors** (reach via Discord `#ask-a-mentor`):

| Mentor | Role | Priority |
|--------|------|----------|
| **Katrin Feierling-Sülzle** | Teacher @ Schule Birklehof | ★ Domain expert — consult early |
| Yue Wu | Founder @ Rocket Tutor | Pitching workshop Sat 4 PM |
| Hannes Metzger | Innovation Manager @ NXTGN | — |
| Tobias Lengfeld | Founder @ LivingLines | — |
| Jakob Seitz | Founder @ LivingLines | — |
| Lukas Heinzmann | Founder @ gyde | — |

**Jurors:**

| Juror | Role |
|-------|------|
| Pierre-Antoine Amiand-Leroy | Coordinator, Hi! PARIS |
| Gwendoline De Bie | Engineering Team Manager @ Hi! PARIS |
| Marc Kirchner | CTO, IPAI Foundation |
| Helena Dittrich | Organisator BJKM |
| Johannes Zimmer | Co-Founder @ Linity |

---

## 🚀 Quickstart

```bash
# Install dependencies
/home/kpihx/.local/bin/uv sync

# Run (placeholder — architecture TBD in Phase 1)
/home/kpihx/.local/bin/uv run python -m insight
```

See `TODO.md` for the active sprint backlog and architectural decisions pending.
