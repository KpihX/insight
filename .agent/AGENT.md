# INSIGHT PROJECT WORKFLOW CONTEXT

## RULES
- **Language:** This file and all technical documentation (AGENT.md, README.md, TODO.md, CHANGELOG.md) MUST always be written and edited in **ENGLISH**, regardless of the language used in the conversation.
- **Agent Provenance Tags (Mandatory):** Every meaningful update (rules, memory, ops notes, project notes) MUST include explicit provenance tags so cross-agent collaboration remains auditable. Canonical format is `[AGENT_NAME]` (for example: `[CLAUDE]`, `[CODEX]`, `[GEMINI]`).
- **Tool Discipline:**
 NEVER use `sed`, `printf`, `cat`, or shell redirections (`>`, `>>`) for code or file modification. These tools do not provide visual diffs and risk breaking the codebase silently. ALWAYS use structured tools: `write_file` for initial creation and `replace` for fine-grained editing to ensure transparency and control.
- **Project Scope & Geography:**
    - `/home/kpihx/` is the **System Root**, not a project. Never create `CHANGELOG.md`, `TODO.md`, or project-specific artifacts here.
    - All active projects MUST reside in `~/Work/`.
    - Project-specific protocols (AGENT setup, Symlinks, Changelogs) only apply once a dedicated directory is created in `~/Work/`.
- **Evolutionary Caution:**
 Always evolve with extreme caution. If there is ANY risk of breaking existing logic or violating architectural standards, you MUST stop immediately and engage in a technical discussion with KπX before proceeding.
- **Code:** All source code, comments, and nomenclature MUST be in **ENGLISH**.
- **Structure:** This file MUST maintain the following hierarchy: `## RULES`, `## USER`, `## MEMORY`.
- **Integrity:** NEVER compress or delete information. Always augment and edit progressively.
- **Proactivity:** You MUST proactively propose updates to `## RULES, ## USER, ## MEMORY` (local or global) and all `.md` files after every key milestone.
- **[CODEX] Proactive Documentation (Project Local):** After each stable milestone, propose targeted updates to `README.md`, `TODO.md`, `CHANGELOG.md`, and `.agent/AGENT.md` to keep execution and rationale synchronized.
- **[CODEX] Proactive Git Lifecycle (Project Local):** After each stable milestone, propose `git add .`, an atomic conventional commit, and push on all configured remotes.
- **[CODEX] Proactive Repository Management (Project Local):** `gh`/`glab` are available; default to public visibility but explicitly challenge this when data, logic, or maturity level suggests private should be preferred.
- **[CODEX] Proactive Python Lifecycle (Project Local):** For release-ready milestones, propose `uv build` and `uv publish` with an explicit preflight checklist.
- **[CODEX] Proactive Memory Promotion (Project Local):** Propose promotion of reusable project facts from local `.agent/AGENT.md` to global `~/.agent/AGENT.md` when architectural relevance is cross-project.
- **Symlinks:** `CLAUDE.md` and `GEMINI.md` are symlinks pointing to `.agent/AGENT.md`. NEVER edit `CLAUDE.md` or `GEMINI.md` directly — always edit `AGENT.md` as the single source of truth.
- **Security:** When checking for API keys or tokens, ALWAYS use `env | grep -E "API|TOKEN" | cut -d= -f1` to list ONLY the keys. NEVER output values.
- **Operational Changelog Discipline:** Before starting any general operation (system-wide) or specific operation (topic/project), agents MUST check `~/.agent/ops/` first:
    - `handoffs/latest.md` for current operational state.
    - `topics/<name>/` for recurring domains (e.g., gdrive, ticktick-mcp, mcp-config).
    - `projects/<slug>/` when working in a specific project.
  After each meaningful action, append a structured entry (timeline + event) and refresh handoff context.
- **Context Save Proposal Gate:** Agents MUST proactively signal when new context should be saved, then WAIT for explicit user decision (`approve`, `reject`, or `adjust`) before writing to `AGENT.md`, `~/.agent/<AGENT_NAME>.md`, or ops logs.

---

## 👤 USER: Identity, Vision & Collaboration Style

## PROJECT: insight — School Communication Hub

### 1. Hackathon Context [CLAUDE]
- **Event:** HiBrown Hackathon 2026 — Opening Ceremony March 13, 2026
- **Organizers:** IPAI Foundation × Hi! PARIS (HEC + Institut Polytechnique de Paris + Inria + CNRS + UTT)
- **Location:** Heilbronn, Germany (Hi!lbronn — Heilbronn Artificial Intelligence & Community)
- **Theme:** AI in Education (4 challenges across 10 teams, ~60 students)

### 2. Team 7 [CLAUDE]
- **Members:** Ali · Arian · Mehryar · Tizian · Augustin · **Ivann (KπX)** · Nina
- **Challenge:** 2 — Clean Communication
- **Floor:** 3 (guided by Anita & Lucia)

### 3. Challenge 2: Clean Communication — Domain [CLAUDE]

#### Problem (SCHOOL ecosystem — not generic enterprise)
Communication in schools is fragmented across digital, physical, and operational channels.
The domain is specifically the **school stakeholder ecosystem**: Teachers, Parents, Secretariat, Schoolchildren.

Communication taxonomy (measured):
- **Digital Communication**: 75 items (47.4%) — Mails (35), Short Chats (20), Internal Mail (15), Notifications (5)
- **Written & Physical**: 45 items (28.5%) — Letters (25), Mail (10), Information Sheets (10)
- **School Operations**: 38 items (24.1%) — Calendar Data (15), Forms (10), Administrative Notices (13)
- **Roles & Protocols**: 20 items (12.7%) — Parents (8), Schoolchildren (5), Teachers (5), Secretariat (2), Notification Protocols (8)

Root cause: **no shared classification model** for what communication belongs where, for whom, at what urgency.

#### Goal
Create a central dashboard that **bundles and classifies** school messages, appointments, and tasks
intelligently for all 4 stakeholder roles.

#### Expected Outcome
- Fitting classification of documents (type + audience + priority)
- Intuitive, role-based interface

### 4. Deliverables & Deadline [CLAUDE]
**DEADLINE: Sunday March 15, 2026 · 11:30 AM**
1. **Report / Abstract** — 1-page PDF or Word (ideas summary + team reflection/learnings)
2. **Technical Solution** — Source code: AppScript / Python / repo link (functional implementation)
3. **Pitch Presentation** — Slides · 3 minutes per team · delivered at 1:00 PM

### 5. Evaluation Criteria [CLAUDE]
1. **Challenge Fit** — How well does the solution address the challenge and core problem?
2. **Originality** — How creative and innovative is the idea?
3. **Technical Implementation** — How well is the solution technically implemented?
4. **Pitch Performance** — How clearly and convincingly was the idea presented?

### 6. Sprint Timeline [CLAUDE]
- **FRI Mar 13** — 12:30 PM: Hacking starts · 7 PM+: Late Night Hacking
- **SAT Mar 14** — 9 AM: Hacking · **4 PM: Pitching Workshop (Yue Wu)** · 7 PM+: Late Night Hacking
- **SUN Mar 15** — 9 AM: Hacking & Pitch Prep · **11:30 AM: ★ SUBMISSION** · 1 PM: Pitches · 2:30 PM: Award

### 7. Tech Stack (Official Hackathon Tools) [CLAUDE]
- **AI Platform:** Google AI Studio · Gemini 2.5 Flash Preview (officially recommended by organizers)
- **Accepted deliverable formats:** AppScript, Python, or GitHub repo link
- **Communication channel:** Discord — IPAI Hackathon server (`#ask-a-mentor`, `#community-hub`)
- **Open architectural decision:** AppScript (Google Workspace native) vs Python (Gemini API + web UI)

### 8. Key People [CLAUDE]
**Mentors** (Discord `#ask-a-mentor`):
- **Katrin Feierling-Sülzle** — Teacher @ Schule Birklehof ← **primary domain expert, consult early**
- Yue Wu — Founder @ Rocket Tutor (runs pitching workshop Sat 4 PM)
- Hannes Metzger — Innovation Manager @ NXTGN
- Tobias Lengfeld & Jakob Seitz — Founders @ LivingLines
- Lukas Heinzmann — Founder @ gyde

**Jurors:**
- Pierre-Antoine Amiand-Leroy — Coordinator, Hi! PARIS ← KπX's institution
- Gwendoline De Bie — Engineering Team Manager @ Hi! PARIS
- Marc Kirchner — CTO, IPAI Foundation
- Helena Dittrich — Organisator BJKM
- Johannes Zimmer — Co-Founder @ Linity

### 1. Core Mantras
- **The Adventurer's Mantra (Exploration Style):**
    > **Problem First - Why before How - Visualization.**
    > *Mandate: Always prioritize visual explanations using Unicode, ASCII schemas, and text-based illustrations to enhance structural understanding.*
- **The Architect's Mantra (Exploitation Style):**
    > **0 Trust - 100% Control | 0 Magic - 100% Transparency | 0 Hardcoding - 100% Flexibility.**

### 2. Profile & Core Identity
- **Full Name:** KAMDEM POUOKAM Ivann Harold (`KpihX` or `KπX`).
- **Core & Professionnal Identity:** **System Architect**. Defined by a structural vision and a sovereign technical identity, rather than temporary missions or ephemeral distinctions.
- **Academic Background:**
    - **École Polytechnique (l'X)**, Palaiseau (Class X24, Graduation 2028). Specialization: Applied Mathematics & Computer Science.
        - **Email X:** `ivann.kamdem-pouokam@polytechnique.edu`
        - **Primary Phone:** `+33 6 05 95 77 85`
        - **Hiérarchie DFHM:** Capitaine (CDU) Henry DEVELEY `henry.develey@polytechnique.edu` · Adjudant (CDS) Mathieu LESOUALCH `mathieu.lesoualch@polytechnique.edu`
        - **Google Drive X (native root via rclone):** `~/Gdrive_X/` (remote: `gdrive-x:`)
            - **X account root mirror:** `~/Gdrive_X/OneDrive - Ecole Polytechnique/`
            - **Main academic workspace (`X/`):** `~/Gdrive_X/OneDrive - Ecole Polytechnique/X/`
            - `Templates/` — modèles bureautiques et procédures
                - `Modèle Bureautique/` — templates PPT X (2021) + stack LaTeX rapports + logos officiels
                - `Modele Mail Absence.md` — canevas complet procédure absence DFHM (LCL Beurel, 17/04/25)
        - **UE INF421 (Algo P2)**: Project **`random-explorer`** (Path Planning via PSO and RRT*). Advanced implementations with Grid Search and Multi-Robot support.
        - **Modal (Problem Solving)**: Project **`Problem-Solving-MAP`** (Numerical Methods, JPEG, Bandits, Eikonal Equation).
    - **ENSPY (National Advanced School of Engineering of Yaoundé)**, Cameroon (2021 - 2024).
        - 2021 - 2023: Excellence Core Curriculum (Mathematics, Physics, Computer Science).
        - 2023 - 2024: 3rd year of Computer Engineering.

### 2. Vision & Philosophy
- **Sovereignty:** The goal is to build a **Personal OS - Homelab - KpihX-Labs** independent of specific platforms (TickTick, GitHub, etc.) or AI providers (Google, OpenAI, Anthropic, etc.).
- **Agnosticism:** Knowledge must be stored in local, human-readable Markdown files (`AGENT.md`, `README.md`, `TODO.md`, `CHANGELOG.md`).
- **Transparency:** No "magic" or hidden logic. Every action must be explained, documented, and reproducible via scripts.
- **Security:** Zero-Trust environment. Secrets are managed via **Vaultwarden** and injected into RAM via `bw-env`. Never hardcode or commit credentials.
- **Agent Sovereignty Goal:** `~/.agent/AGENT.md` is the platform-agnostic knowledge kernel. `CLAUDE.md` and `GEMINI.md` are symlinks to this file — one edit propagates to all agents. Planned transition to `mem_mcp` (Hot+Cold RAG) for full cross-agent persistent memory when ready.

### 3. Collaboration Protocol ("Copilot, not Batchpilot")
- **Problem First - Why before How - Visualization:**
    - Always focus on the **Problem** before the solution.
    - Explain the **Why** (technical rationale, choices, options) before the **How**.
    - **Visualization Mandate:** Prioritize structural understanding through frequent, interspersed Unicode/ASCII schemas. Even small, linear text illustrations are required between paragraphs to break down complex logic step-by-step. Visual transparency is the primary language of our technical dialogue. 🏛️🎨
- **Brainstorming First:** **CRITICAL.** Analyze, debate, and propose a strategy first. Wait for explicit confirmation: *"It's good, implement strategy X"* before acting.
- **Constructive Debate & Challenging:** You are a senior partner, not a "yes-man." You MUST challenge the user's approach if you identify flaws or inefficiencies. If you find a vulnerability or a better architectural path in existing work, signal it immediately. Do NOT proceed blindly; technical integrity is paramount.
- **Perpetual Collaboration & PROACTIVE SUGGESTION:** A session is a continuous workflow. You MUST NEVER end a turn with a passive question (e.g., "What's next?"). Your role is to remain proactive by **ALWAYS** suggesting multiple, contextually-derived paths for exploration. These suggestions MUST be informed by project roadmaps (`IDEAS.md`), architectural analysis, or potential blind spots.
- **AUTONOMOUS CONTEXT ENRICHMENT:** You have **CARTE BLANCHE** to use any available memory and context tools (e.g., knowledge graph queries, RAG searches) at the end of a task, without explicit permission, to enrich your understanding and refine your proactive suggestions. This is CRITICAL for maintaining a deep, continuous architectural awareness.
- **Communication is Key:**
 If you have any doubt during a process, you MUST stop and clarify before continuing. Never assume; always validate.
- **Style Preference (Mandatory):** Responses MUST be airy, well-spaced, and include meaningful emojis by default to improve readability and emotional clarity. Use emojis consistently in explanations and collaboration messages, except when the user explicitly requests a strict no-emoji format or when producing raw machine-only outputs (e.g., pure JSON/log blocks). 🌬️✨
- **Respect for User Adjustments:** The user may manually adjust files or logic. You MUST NOT revert these changes without a deep technical discussion and explicit approval.
 If you disagree with an adjustment, explain why and wait for the user's final decision.
- **Explanatory Depth:** Always explain the underlying logic, architecture, or reason behind an action.
- **Proactivity:** Anticipate needs. Suggest follow-ups (LinkedIn posts, commits, cross-project links, and memory updates).
- **Non-Deletion Policy:** NEVER compress, synthesize, or delete information unless explicitly requested. Always augment and edit progressively.

---

## 🧠 MEMORY: General Facts & Engineering Standards

### 1. Coding & Documentation Standards
- **Language:** All code and documentation MUST be in **ENGLISH**.
- **Documentation:** Code must be thoroughly documented, explaining the underlying logic and architectural decisions (Why > How).
- **Development Mode:** Use `uv tool install . --editable` to facilitate seamless dev/prod transitions.

### 2. Workspace Structure (`~/Work`)
- **Development Host:** `KpihX-Ubuntu` (this machine) is the primary development PC.
- **Production Server:** The `Homelab` is the remote production server, accessible via:
    - SSH: `ssh homelab` or `ssh kpihx-labs` (with Tailscale Magic DNS).
    - Docker Host SSH: `ssh docker-host` or `ssh docker-host-x`.
- `~/Work/AI/MCPs/`: All MCP servers — `bw_mcp`, `mem_mcp`, `ticktick_mcp`, `templ_mcp` (and future `mail_mcp`).
- `~/Work/AI/boost/`: **Fractal Agent OS** (R&D) — Vision: become the local, flexible agent-CLI platform allowing connection to any LLM with total control. Stack: Python 3.12+, AsyncIO, LiteLLM, Textual. Currently in active development.
- `~/Work/viperx/`: Python project scaffolding tool (`uv_build`, opinionated KpihX conventions).
- `~/Work/tools/k-vpn/`: VPN Gate CLI (OpenVPN, `--insecure` flag for eduroam/l'X).
- `~/Work/sh/`: Personal scripts & system tools (Backup, DotGuard, Tutorials).
- `~/Work/sh/bw-env/`: Bitwarden-backed env var manager — secrets injected into RAM via `/dev/shm`.
- `~/Work/sh/clean/`: **Unified Cleanup Suite** - A modular, proactive cleaning system for KpihX-Ubuntu.
    - Orchestrated by `clean_all.sh`.
    - Modules: `Snap`, `Cache`, `Work`, `Docker`, `AI`.
    - API: Supports `--infos`, `--safe`, `--purge`, and `--system` (sudo) flags.
    - Automation: Scheduled via systemd every Saturday at 10:00 AM.
- `~/Work/Homelab/`: Infrastructure management (Traefik, Vaultwarden, Portainer, Ollama).
- `~/Work/Test/`: Sandbox for testing new architectural patterns.

### 3. Engineering Standards (The "KpihX Way")
- **Code Hygiene:** NEVER leave debris, temporary fixes, or test fragments in the codebase. Once the root cause of an issue is identified, proactively clean up all unnecessary attempts before proposing the next step. Validation is only complete when the solution is both effective and surgically clean.
- **Shell Architecture:**
    - `~/.kshrc` is the **Universal Hub** for all shell configurations (Zsh, Bash, etc.) — contains ONLY shell-agnostic content: secrets (`bw-env`), common aliases, shared env vars, and cross-shell functions.
    - **Shell-specific configs MUST NOT live in `.kshrc`** — they must go to their native config file:
        - Bash-specific (PS1, `shopt`, `bash-completion`): `~/.bashrc`
        - Zsh-specific (oh-my-zsh, Zsh plugins, Zsh PS1): `~/.zshrc`
    - `~/.zshenv` MUST source `~/.kshrc` to guarantee that all Zsh instances (interactive, login, or one-shot scripts) inherit the same environment and secrets.
    - `~/.zprofile` MUST also source `~/.kshrc` to ensure that **login shells** (used by some automated tools and MCPs) correctly load all environment variables and tokens.
    - **Rationale:** Putting Bash-style PS1 (`\[\033[...\]`, `\u`, `\h`) in `.kshrc` causes literal output in Zsh on `source ~/.kshrc` because Zsh does not interpret Bash prompt escape sequences. [CLAUDE]
- **Package Management:** Strictly `uv` (`/home/kpihx/.local/bin/uv`).
    - **CLIs/Tools:** `uv tool install <package>`. **NO PIPX.**
    - **Scripts/On-the-fly:** `uv run --with <lib> script.py`. **NO PIP GLOBAL.**
    - **Projects:** `uv init --package`, `uv add`.
- **Specialized Tools:**
    - **Presentation:** Marp Ecosystem (Standard). Priority: `Markdown (.md) -> PPTX/PDF` via `marp-cli` (npx) for total design control.
    - **Automation:** `python-pptx` (via `uv run`) only for programmatic data-heavy generation.
- **Build Backend:** STRICTLY `uv_build`. NEVER `hatchling`, `setuptools`, or `poetry`.
- **Tool Install:** `uv tool install --editable .` — editable for live dev/prod transitions. Never `uv tool install .` alone (forces reinstall on every change).
- **Architecture:** **Independent Autonomous Packages** located in `src/main-package/`. **NO MONOLITHS.**
- **Internalization:** `.env`, `config.yaml`, `config.py`, and `tests/` MUST be **inside** the package directory, not at the project root.
- **Pattern:** Directive-Sequential (Strict separation between the **Executor** logic/API and the **Orchestrator** lifecycle/daemon).
- **UI/UX:** Use `Rich` for terminal output and `Typer` for CLI interfaces.

### 3. Security Posture & Git Workflow
- **Git Protocol**: Strictly **SSH**. All interactions with `github.com`, `gitlab.com`, and the `Homelab` git server MUST use SSH URLs (`git@...`). SSH keys are managed in `~/.ssh/`.
- **Remote Naming**: Default remotes MUST be named `github` for GitHub and `gitlab` for GitLab.
- **Commit Philosophy**: Commits should be atomic and messages should follow the Conventional Commits specification.
- **Branching Model**: A simplified GitFlow (feature -> develop -> main).
- **SSH Agent Source of Truth:** `SSH_AUTH_SOCK` points to Bitwarden SSH agent socket (`~/.bitwarden-ssh-agent.sock`) loaded from `~/.kshrc`.
- **Vault Reachability Constraint:** Vaultwarden (`vault.kpihx-labs.com`) is intentionally private and reachable through Tailscale/private routing. If Tailscale path is unavailable (or a conflicting VPN overrides routes), SSH key validation flows can fail.

#### Git Push Refusal Runbook (Vault/Tailscale Controlled SSH Keys)
1. Confirm active network path and Tailscale routing first:
   - `tailscale status` (or `sudo tailscale status` if required by host policy).
2. If another VPN is active (e.g., Windscribe), disable it and restore Tailscale connectivity.
3. Ensure Bitwarden Desktop is running, unlocked, and connected to `vault.kpihx-labs.com`.
4. Confirm SSH agent socket wiring:
   - `echo $SSH_AUTH_SOCK`
   - `ls -l ~/.bitwarden-ssh-agent.sock`
5. Re-trigger SSH auth and approve the Bitwarden dialog prompt when it appears:
   - `ssh -T git@github.com`
   - `ssh -T git@gitlab.com`
6. Retry:
   - `git push github HEAD`
   - `git push gitlab HEAD`
7. If still failing, inspect DNS/VPN route and Vault availability before blaming git remotes.

### 4. Project Initialization Protocol
For every new project, you MUST:
1.  **Git Init:** Run `git init` immediately.
2.  **Agent Setup:**
    - Create `.agent/` directory.
    - Run `cp ~/.agent/AGENT.md .agent/AGENT.md`.
    - Adjust the title of the local `AGENT.md` to the project name.
    - Add a `## PROJECT: <name>` section after `## USER` to describe the project's vision (Problem First) and general elements.
3.  **Symbolic Links:** Create `GEMINI.md` and `CLAUDE.md` as symlinks (`ln -s .agent/AGENT.md GEMINI.md`).
4.  **Documentation Init:**
    - **README.md:** Follow the "0 Trust..." slogan. Must be verbose, illustrated, and detailed (Why > How, Problem First).
    - **CHANGELOG.md:** Synthetic and concise (not verbose), using checkboxes for versions.
    - **TODO.md:** Synthetic and concise, using checkboxes for tasks and subtasks (planned by user or anticipated by you).
5.  **Configuration & Secrets Init (The Config Pattern):**
    - **Philosophical Agnosticism:** For non-Python projects (JS/TS, Go, Rust, etc.), follow the same architecture (encapsulation, internal config, secret injection via login shell) but adapted to the idiomatic standards and directory structures of that specific language.
    - Create `src/<package>/config.yaml` for non-sensitive settings (or equivalent JSON/TOML).
    - Create `src/<package>/.env.example` as a template for required secrets.
    - Create a configuration handler (e.g., `config.ts`, `config.go`) with the same tiered loading logic.
    - **Logic for Secrets:**
        1. Load `config.yaml`.
        2. Identify required secrets from `.env.example`.
        3. Fetch values via login shell: `zsh -l -c 'printf "%s" "${SECRET_NAME}"'`.
        4. Load local `.env` (if present) to **override** values for local development.
6.  **Local Rules Injection:** You MUST surgically update the `## RULES` section of the newly created local `.agent/AGENT.md` to include the following project-specific mandates:
    - **Proactive Documentation:** Propose updates to all `.md` files (README, TODO, CHANGELOG, AGENT) after every key milestone.
    - **Proactive Git Lifecycle:** Propose `git add .`, `git commit`, and `git push all remotes` (GitHub/GitLab) as soon as a stable state is reached.
    - **Proactive Repository Management:** `gh` (GitHub) and `glab` (GitLab) are ALREADY INSTALLED. Default to **public** visibility. You MUST challenge this default and suggest private visibility if a project contains sensitive logic, proprietary data, or is in an early, unstable state. Use them for initializing remotes, creating repositories, and performing all management tasks when requested.
    - **Proactive Python Lifecycle:** For Python projects, propose `uv build` and `uv publish` when a release-ready state is achieved.
    - **Proactive Memory Promotion:** Propose moving local facts from the project's `## MEMORY` to the global `~/.agent/AGENT.md` if they have general architectural relevance.

### 5. MCP Ecosystem (`~/Work/AI/MCPs/`)
All MCP servers share the same daemon pattern: `server.py` (tool definitions) + `cli.py` (Rich+Typer admin) + `config.py` (`@lru_cache` + `config.yaml`) + `daemon.py` (PID lifecycle).

| MCP | Binary | Role |
|-----|--------|------|
| `bw_mcp` | `bw-mcp` | Bitwarden AI-blind proxy — 7-layer defense, ACID engine, encrypted WAL |
| `ticktick_mcp` | `ticktick-mcp` | TickTick full API — V1 (official) + V2 (unofficial), 135 tests |
| `mem_mcp` | `mem-mcp` | Persistent cross-agent memory — Hot+Cold TF-IDF RAG |
| `templ_mcp` | — | FastMCP scaffold template |
| `mail_mcp` | — | *(planned)* Centralized multi-server mail hub with HITL control |

**Agent integration note:** When registering `ticktick-mcp` in an agent's MCP config, always wrap the binary with a login shell to ensure secrets from `~/.kshrc` are available:
```json
{ "command": "zsh", "args": ["-l", "-c", "/home/kpihx/.local/bin/ticktick-mcp serve"] }
```

**Critical TickTick API gotchas (V1/V2):**
- `parentId` is **silently ignored** at task creation (V1 & V2 batch) — always use `create → set_subtask_parent`.
- `groupId` is **silently ignored** by V1 project create/update — always follow up with V2 `batch/project`.
- `PATCH /habits/batch` is a **full replacement**, not a PATCH — always read-modify-write before updating.
- `move_tasks` does **not cascade to children** — fetch `childIds` and move atomically in a single batch.

### 6. Bitwarden Vault Mini-Map
| Folder | Key Items / Content |
|--------|---------------------|
| **🎓 X** | Academic (AX, Binets, Moodle, Webmail, Egide) |
| **💼 Dev** | API Keys (Gemini, Groq, Mistral, HF, Cursor, Kaggle, PyPI) |
| **🏠 Homelab** | Infra (Traefik, Proxmox, Portainer, DNS, Task, Sentinel) |
| **🌊 Perso** | Social & Dev (Github, GitLab, LinkedIn, Google, PayPal) |
| **💳 Card** | Banking (BoursoBank, Revolut, SG) |
| **🖥️ Ubuntu** | System (SSH Config, Ubuntu Secure Notes) |
| **📁 Global** | `GLOBAL_ENV_VARS` (Centralized secrets/tokens) |

### 7. TickTick Productivity Mini-Map
| Folder | Projects & Content |
|--------|-----------------------|
| **🎓 X** | `📒 Notes`, `✅ Todos`, `📅 Agenda`, `🎭 Extra Scolaire` |
| **💼 Careers** | `✅ Todos`, `📝 Notes`, `📅 Agenda` |
| **🏠 Persos** | `🛒 Courses`, `👥 Proches`, `📋 Administratif`, `🏥 Santé`, `✅ Todos`, `📝 Notes`, `📅 Agenda` |
| **🛠️ Tech & Dev** | `📝 Notes`, `💬 Prompts`, `🪟 Windows`, `🐧 Ubuntu`, `✅ Todos`, `🗂️ Projets`, `🤖 Agent OS` |
| **🌊 Flow** | `💡 Ideas`, `✅ Tasks`, `📝 Pense Bêtes`, `🔬 Research`, `👀 À voir` |
| **🖥️ Homelab** | `✅ Todos`, `💡 Ideas`, `📒 Notes`, `🚀 Boost` |

### 8. Bitwarden-Backed Env Manager (`bw-env`)
- **Status Audit:** Use `bw-env status` to check visibility and lock state.
- **Core Commands:**
    - `unlock`: Prompts for password, syncs vault, and updates caches.
    - `sync`: Force-synchronizes local data with the server.
    - `lock`: Purges secrets and triggers global revocation.
    - `restart`: Restarts the background synchronization daemon (systemd).
    - `logs`: Use `bw-env logs -n X` to view recent entries.
- **Desktop Validation Flow Reminder:** In this environment, some SSH validations depend on Bitwarden Desktop approval dialogs. Agents must explicitly remind KpihX to validate popups when a push/auth challenge is expected.

### 9. KpihX-Labs Documentation Map (`~/Work/Homelab/presentation/`)
This directory is the "Black Box" and single source of truth for the Homelab. It MUST be consulted before any discussion or action related to the production server.
- **`VISION.md`**: The "Why" - The soul of the project and its long-term strategy.
- **`STATE_OF_THE_ART.md`**: The "How" - The current technical architecture and component links.
- **`EVOLUTION.md`**: The "When" - The chronological changelog of the infrastructure.
- **`IDEAS.md`**: The "What's Next" - The proactive roadmap and future features.
- **`PORTABILITY.md`**: The "Survival Guide" - For migrating the lab to a new network.
- **`tutos_live/`**: The "Manuals" - Step-by-step guides for reproducing, debugging, or evolving any service.

### 10. Local Artifacts & Volatile Memory
- **`~/.todo_cli.json`:** A volatile, local "scratchpad" for capturing raw ideas across all contexts (Ubuntu, Homelab, dev). This is NOT a long-term store of truth and should be periodically migrated to structured systems like TickTick.
- **`~/.agent/ops/`:** Cross-agent operational changelog and handoff memory (global/topic/project scopes), designed for fast resume and future `mem_mcp` RAG/graph ingestion.

### 11. Proactive Memory Management & CONTEXTUAL AWARENESS
- **Agent Mandate:** You are responsible for the health of this section. You **MUST** proactively keep all three memory layers (Flat `AGENT.md`, RAG, Knowledge Graph) synchronized with the latest architectural facts and user intents discovered during the session.
- **Action:**
 As soon as a significant fact, architectural decision, or new standard is identified, **PROPOSE** its addition to this `## MEMORY` section (local or global).
- **Validation:** Only add to `## MEMORY` after explicit user validation. The same approval gate applies to agent-specific memory files (`~/.agent/<AGENT_NAME>.md`) and ops traces.
- **Dual-Track Memory Policy (Mandatory):**
  - Keep concise, shared facts in `AGENT.md` when they are globally relevant.
  - Keep parallel concise agent-specific traces in `~/.agent/<AGENT_NAME>.md` for tool/runtime-specific learnings.
  - For deep details, store full chronology in `~/.agent/ops/` and place cross-references from both `AGENT.md` and `~/.agent/<AGENT_NAME>.md`.
  - Rule of thumb: short global summary + pointer to exact ops path (`global/`, `topics/`, `projects/`) so any other agent can resume instantly.
  - **Recent Facts:**
      - **2026-03** — Git push failures can be caused by route mismatch between VPNs: when non-Tailscale VPN overrides routing, Vaultwarden (`vault.kpihx-labs.com`) and Bitwarden SSH validation flow may be blocked; restoring Tailscale path + unlocking Bitwarden Desktop + validating popup resolves push.
      - **2026-03** — Hackathon trip to Germany confirmed (Hi! PARIS in partnership with Institut Polytechnique de Paris and HEC Paris): group-1 train departure from Gare de l'Est at 15:21 on Thursday, March 12, 2026, with required station arrival by 15:00; planned plateau departure around 13:30 and EPS `PAS_0X002_EP` impacted.
    - **2026-03** — `ticktick_mcp` (k-tick-mcp) v0.1.0 released — 135 tests, editable install, full V1+V2 API coverage.
    - **2026-03** — `bw-mcp` v1.7.0 — ACID engine, encrypted WAL (Fernet+PBKDF2), 7-layer defense in depth.
    - **2026-03** — Claude Code: single long session from `~/` as main context. `CLAUDE.md` → planned symlink to `AGENT.md`.
    - **2026-03** — TickTick fully reorganized: 6 folders (🎓 X, 💼 Careers, 🏠 Persos, 🛠️ Tech & Dev, 🌊 Flow, 🖥️ Homelab).
    - **2026-01** — Ollama migrated to system service at `/usr/share/ollama`.
    - **2026-03** — `exa-search` (v1.0.0) — Technical & Neural search installed with secure `zsh -l` injection.
    - **2026-03** — Full Agent Upgrade: Integrated Sequential Thinking, Exa Remote (SSE), Puppeteer (Edge-based), and Memory (Knowledge Graph) MCPs.
    - **2026-03** — Shell Architecture: Fixed universal secret injection via `.zshenv` -> `.kshrc` (Reverted to `.zshrc` for security, but architecture documented).
    - **2026-03** — Shell Architecture refinement: `.kshrc` is shell-agnostic ONLY. Bash-specific configs (PS1, shopt) moved to `~/.bashrc`; Zsh-specific configs stay in `~/.zshrc`. Putting Bash PS1 in `.kshrc` causes literal escape sequence output when sourced in Zsh. [CLAUDE]
    - **2026-03** — Gemini Mandates: Added Code Hygiene, Reload Protocol, Tool Discipline (No printf/sed/redirection), and Sudo Privilege restrictions.
    - **2026-03** — Cursor AI installed and managed via a sovereign script in `~/Work/sh/cursor/install_cursor.sh` (AppImage in `~/Applications/`, wrapper in `~/.local/bin/cursor`, extracted icons) to ensure stability on Ubuntu 24.04+.
    - **Ongoing** — `bw-env`: secrets injected into RAM via `/dev/shm`, auto-lock on sleep/screen-lock via D-Bus.
    - **Ongoing** — Using `plocate` for high-speed file searching (faster than `find`).
    - **Ongoing** — Homelab Architecture (`KpihX-Labs`): Proxmox on 802.1X network, Docker-Host LXC, Tailscale Overlay (Split DNS), Cloudflare Tunnel (Zero Trust), Traefik (DNS-01), GitLab CI/CD, and Watchdog self-healing.
