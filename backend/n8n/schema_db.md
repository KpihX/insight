# insight — Database Schema

## Database

```text
nextgen
```

## Collections

```text
staff_directory
family_directory
school_events
```

## 1. staff_directory

### Business key

```text
staff_id
```

### Shape

```json
{
  "staff_id": "staff_1",
  "name": "Sarah Lee",
  "role": "teacher",
  "contacts": ["sarah.lee@example.com"],
  "aliases": ["Sarah Lee", "Lee"]
}
```

## 2. family_directory

### Business key

```text
family_id
```

### Shape

```json
{
  "family_id": "parent_1",
  "parent_names": ["Jane Doe"],
  "parent_contacts": ["+15559876543", "jane.doe@example.com"],
  "student_names": ["Tim Doe"],
  "aliases": ["Jane Doe", "Doe family", "Tim Doe"]
}
```

## 3. school_events

### Business key

```text
original_id
```

### Shape

```json
{
  "source_system": "whatsapp",
  "source_channel": "group_messaging",
  "sender_name": "Jane Doe",
  "sender_contact": "+15559876543",
  "receivers": ["staff_1", "staff_2", "staff_3"],
  "subject": null,
  "content": "Hello, Jane Doe here. Tim Doe will be absent today because he has a fever.",
  "timestamp": "2026-03-14T07:15:00.000Z",
  "original_id": "SEED-EVENT-0001",
  "sender_group": "parent",
  "category": "absence_report",
  "urgent": false,
  "important": true,
  "action_required": false,
  "status": "new",
  "handled_by": null,
  "handled_at": null,
  "archived_by": null,
  "archived_at": null,
  "action_note": null,
  "summary": "Jane Doe reports that Tim Doe will be absent today.",
  "received_at": "2026-03-14T07:15:20.000Z",
  "classified_at": "2026-03-14T07:15:24.000Z"
}
```

### Status lifecycle

```text
new -> handled -> archived
```

### Read-side deduplication rule

When multiple rows accidentally share the same `original_id`, the Read API prefers:

```text
archived > handled > new
then latest timestamp wins
```
