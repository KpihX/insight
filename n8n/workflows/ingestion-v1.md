# insight — Ingestion v1.0

Workflow ID: `yBh4AiGZZCMmHTIg`

## Purpose

Normalize incoming school communication, enrich it with directory context, classify it with Gemini, persist it to MongoDB, and index it in Qdrant.

## Topology

```text
Email Trigger (IMAP) ---\
WhatsApp Trigger --------> normalize-* -> Load Staff/Family -> Pack -> Merge -> pre-classify
School Portal Trigger ---/                                                       |
Manual demo inputs --------------------------------------------------------------/

pre-classify
  -> Message a model (Gemini 2.5 Flash)
  -> Parse Classified Event
  -> MongoDB Save
  -> Qdrant Vector Store
       ^ Embeddings Google Gemini
       ^ Default Data Loader
```

## Code nodes

| Node | Local source |
|------|--------------|
| `normalize-email` | [`../nodes/ingestion/normalize-email.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/normalize-email.js) |
| `normalize-wa` | [`../nodes/ingestion/normalize-wa.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/normalize-wa.js) |
| `normalize-webhook` | [`../nodes/ingestion/normalize-webhook.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/normalize-webhook.js) |
| `Pack Staff Directory` | [`../nodes/ingestion/pack-staff-directory.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/pack-staff-directory.js) |
| `Pack Family Directory` | [`../nodes/ingestion/pack-family-directory.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/pack-family-directory.js) |
| `pre-classify` | [`../nodes/ingestion/pre-classify.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/pre-classify.js) |
| `Parse Classified Event` | [`../nodes/ingestion/parse-classified-event.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/parse-classified-event.js) |

## Demo-only input nodes

Manual triggers:

- `Run email_json_record`
- `Run msg_json_record`
- `Run demo records`

Static event generators:

- `email_json_record` -> [`../nodes/ingestion/email-json-record.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/email-json-record.js)
- `msg_json_record` -> [`../nodes/ingestion/msg-json-record.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/msg-json-record.js)

These are only for deterministic demo runs. They are not part of the live source layer.
