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
| `normalize-email` | [`../nodes/ingestion/normalize-email.js`](../nodes/ingestion/normalize-email.js) |
| `normalize-wa` | [`../nodes/ingestion/normalize-wa.js`](../nodes/ingestion/normalize-wa.js) |
| `normalize-webhook` | [`../nodes/ingestion/normalize-webhook.js`](../nodes/ingestion/normalize-webhook.js) |
| `Pack Staff Directory` | [`../nodes/ingestion/pack-staff-directory.js`](../nodes/ingestion/pack-staff-directory.js) |
| `Pack Family Directory` | [`../nodes/ingestion/pack-family-directory.js`](../nodes/ingestion/pack-family-directory.js) |
| `pre-classify` | [`../nodes/ingestion/pre-classify.js`](../nodes/ingestion/pre-classify.js) |
| `Parse Classified Event` | [`../nodes/ingestion/parse-classified-event.js`](../nodes/ingestion/parse-classified-event.js) |

## Demo-only input nodes

Manual triggers:

- `Run email_json_record`
- `Run msg_json_record`
- `Run demo records`

Static event generators:

- `email_json_record` -> [`../nodes/ingestion/email-json-record.js`](../nodes/ingestion/email-json-record.js)
- `msg_json_record` -> [`../nodes/ingestion/msg-json-record.js`](../nodes/ingestion/msg-json-record.js)

These are only for deterministic demo runs. They are not part of the live source layer.

Current demo scenarios:

- `email_json_record`: an administrative email from David Brown to Sarah Lee confirming a parent meeting for Tim Doe on Tuesday, March 17, 2026 from 4:00 PM to 5:00 PM.
- `msg_json_record`: a parent WhatsApp-style message from Jane Doe reporting Tim Doe absent for the day.

For live WhatsApp tests, `David Brown` also exposes the alias `kπx-labs` in `staff_directory`, so the `pre-classify` step can resolve the sender from `fromName` even when the WhatsApp contact identifier is opaque.

For direct WhatsApp messages without explicit receiver metadata, the model can also return `inferred_receivers`. The prompt is enriched with candidate staff entries from `staff_directory` so the model can pick exact canonical names. `Parse Classified Event` keeps the same final storage contract by writing only `receivers`, using explicit values first and inferred receiver tokens only as a fallback.

`pre-classify` also derives a `temporal_context` block from the normalized event timestamp. The model uses this anchor to resolve relative expressions such as `tomorrow`, `next week`, or `next Tuesday` into explicit ISO dates inside `calendar_patch.date`.
