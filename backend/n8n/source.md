# insight — Source Layer

## Live connectors

### IMAP

```text
Email Trigger (IMAP)
-> normalize-email
```

Used when a real mailbox is connected to the ingestion workflow.

### WhatsApp

```text
Baileys bridge
-> POST /webhook/wa-event or /webhook-test/wa-event
-> WhatsApp Trigger
-> normalize-wa
```

Important:

- the bridge uses **pairing code mode**
- it does **not** use QR mode
- runtime auth files are stored under `backend/wa-auth/`

### School portal

```text
POST /webhook/portal-event
-> School Portal Trigger
-> normalize-webhook
```

## Demo-only connectors

The ingestion workflow also contains two deterministic demo inputs:

- `email_json_record`
- `msg_json_record`

They are useful when:

- you do not want to wait for real live inputs,
- you want predictable smoke-test behavior,
- you want to demo the pipeline without touching production channels.

Current demo split:

- `email_json_record` simulates an administrative meeting email targeted to `staff_1` (`Sarah Lee`) so the frontend can render a timetable patch.
- `msg_json_record` simulates a parent absence report so the frontend can show a standard live event card.

## Normalized event model

All connectors converge to the same intermediate shape:

```json
{
  "source_system": "imap | whatsapp | school_portal",
  "source_channel": "mailbox | group_messaging | webhook",
  "sender_name": "Jane Doe",
  "sender_contact": "+15559876543",
  "receivers": ["teachers"],
  "subject": null,
  "content": "Message body",
  "timestamp": "2026-03-14T07:15:00.000Z",
  "original_id": "SEED-EVENT-0001"
}
```
