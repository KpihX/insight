# insight — Ingestion v1.0

Workflow ID: `yBh4AiGZZCMmHTIg`

## Purpose

Normalize incoming school communication, enrich it with directory context, classify it with a model, persist it to MongoDB, and index it in Qdrant.

For meeting-like communication, the model also extracts an explicit `assist.calendar_patch` payload so the frontend can render timetable events without guessing from raw text.

## Topology

```text
Email Trigger (IMAP) ---\
WhatsApp Trigger --------> normalize-* -> Load Staff/Family -> Pack -> Merge -> pre-classify
School Portal Trigger ---/                                                       |
Manual demo inputs --------------------------------------------------------------/

pre-classify
  -> Message a model
  -> Parse Classified Event
  -> MongoDB Save
  -> Qdrant Vector Store
       ^ embeddings node
       ^ Default Data Loader
```

## Code nodes

| Node | Local source |
|------|--------------|
| `normalize-email` | [`../nodes/ingestion/normalize-email.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/normalize-email.js) |
| `normalize-wa` | [`../nodes/ingestion/normalize-wa.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/normalize-wa.js) |
| `normalize-webhook` | [`../nodes/ingestion/normalize-webhook.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/normalize-webhook.js) |
| `Pack Staff Directory` | [`../nodes/ingestion/pack-staff-directory.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/pack-staff-directory.js) |
| `Pack Family Directory` | [`../nodes/ingestion/pack-family-directory.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/pack-family-directory.js) |
| `pre-classify` | [`../nodes/ingestion/pre-classify.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/pre-classify.js) |
| `Parse Classified Event` | [`../nodes/ingestion/parse-classified-event.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/parse-classified-event.js) |

## Demo-only input nodes

Manual triggers:

- `Run email_json_record`
- `Run msg_json_record`
- `Run demo records`

Static event generators:

- `email_json_record` -> [`../nodes/ingestion/email-json-record.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/email-json-record.js)
- `msg_json_record` -> [`../nodes/ingestion/msg-json-record.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/ingestion/msg-json-record.js)

These are only for deterministic demo runs. They are not part of the live source layer.

Current demo scenarios:

- `email_json_record`: an administrative email from David Brown to Sarah Lee announcing a mandatory meeting on Monday, March 16, 2026 from 2:00 PM to 3:00 PM.
- `msg_json_record`: a parent WhatsApp-style message from Jane Doe reporting Tim Doe absent for the day.
