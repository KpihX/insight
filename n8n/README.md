# n8n — Pipeline Reference

## Architecture

```
[IMAP Email Trigger]     ──► [normalize-email]   ──┐
[WA Webhook Trigger]     ──► [normalize-wa]      ──┼──► [pre-classify] ──► [Google Gemini] ──► [Parse Classified Event] ──► [MongoDB Save]
[Portal Webhook Trigger] ──► [normalize-webhook] ──┘
```

All logic lives in n8n Code nodes (JavaScript). No external API servers.
The positioning is intentionally lightweight and pragmatic, not a heavy dynamic orchestration system like SDUI.

---

## Runtime Target

- Default runtime: online n8n `https://nextgen-n8n.westeurope.cloudapp.azure.com`
- Local fallback: `http://localhost:5678`
- Tailnet/Funnel fallback: `https://kpihx-ubuntu.tail2527bd.ts.net`
- `wa-bridge.js` reads `.env.n8n` and switches with `N8N_TARGET=cloud|local|tailnet`
- Emergency override: `N8N_WA_WEBHOOK=https://... node wa-bridge.js`

---

## Data Flow & Fixtures

Each fixture file shows the exact JSON shape at that pipeline stage.

| Stage | File | Node |
|-------|------|------|
| `00` | `fixtures/00_email_trigger_raw.json` | IMAP Email Trigger output |
| `01` | `fixtures/01_wa_trigger_raw.json` | WhatsApp Webhook input (Baileys) |
| `02` | `fixtures/02_school_event_mailbox.json` | After `normalize-email` Code node |
| `03` | `fixtures/03_school_event_group_messaging.json` | After `normalize-wa` Code node |
| `04` | `fixtures/04_school_event_preclassified.json` | After `pre-classify` Code node |
| `05` | `fixtures/05_school_event_classified.json` | After `Parse Classified Event` Code node |

---

## Node Sources

Code node JavaScript is version-controlled in `nodes/`. Copy-paste into n8n Code nodes.

| File | n8n Node Name |
|------|---------------|
| `nodes/normalize-email.js` | `normalize-email` |
| `nodes/normalize-wa.js` | `normalize-wa` |
| `nodes/normalize-webhook.js` | `normalize-webhook` |
| `nodes/pre-classify.js` | `pre-classify` |
| `nodes/gemini-classify.js` | legacy code-only fallback reference |

---

## n8n Variables (Settings -> Variables)

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Group 7 Gemini API key (shared hackathon runtime key) |
| `CLASSIFIER_MEMORY_NOTE` | Optional lightweight memory note for the classifier |

Current runtime note:
- the online workflow now uses the official Google Gemini n8n node for model calls
- the final `SchoolEventClassified` object is assembled in `Parse Classified Event`

---

## MongoDB Credential (Online Runtime)

Use this inside n8n (Credentials -> MongoDB):

- Configuration Type: `Connection String`
- Connection String: the shared CosmosDB connection string used by the hackathon team
- Database: `nextgen`
- Use TLS: `ON`
- Client certificates: all empty

This is the shared online database used by the current non-local deployment.

---

## SchoolEvent — Canonical Schema

All normalizers output this shape.

```json
{
  "source_system": "imap | whatsapp | school_portal",
  "source_channel": "mailbox | group_messaging | webhook",
  "sender_name": "string | null",
  "sender_contact": "string | null",
  "receivers": ["string"],
  "subject": "string | null",
  "content": "string",
  "timestamp": "ISO-8601 string",
  "original_id": "string"
}
```

---

## Adding a New Input Source

1. Create a new trigger node in n8n (webhook, cron, API poll, etc.)
2. Copy `nodes/normalize-email.js` as a template
3. Map your source fields to the canonical SchoolEvent schema
4. Wire the new normalizer's output to **pre-classify**
5. Add fixtures for trigger, `SchoolEvent`, `SchoolEventPreclassified`, and `SchoolEventClassified`
