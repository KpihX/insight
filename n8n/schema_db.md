# insight — Database Schema

> Database: `nextgen`
> Core collection: `school_events`

---

## Visual Model

```text
                    +----------------------+
                    |   staff_directory    |
                    |----------------------|
                    | staff_id             |
                    | name                 |
                    | role                 |
                    | contacts[]           |
                    | aliases[]            |
                    +----------+-----------+
                               |
                               | receiver resolution
                               |
+----------------------+       |
|   family_directory   |       |
|----------------------|       |
| family_id            |       |
| parent_names[]       |       |
| parent_contacts[]    |       |
| student_names[]      |       |
| aliases[]            |       |
+----------+-----------+       |
           |                   |
           +-------------------+
                               |
                               v
                    +----------------------+
                    |    school_events     |
                    |----------------------|
                    | _id                  |
                    | source_system        |
                    | source_channel       |
                    | sender_name          |
                    | sender_contact       |
                    | receivers[]          |
                    | subject              |
                    | content              |
                    | timestamp            |
                      | original_id          |
                      | sender_group         |
                      | category             |
                      | urgent               |
                      | important            |
                      | action_required      |
                    | summary              |
                    | received_at          |
                    | classified_at        |
                    +----------------------+
```

---

## Collections

```text
school_events
= stores SchoolEventRecord documents

staff_directory
= stores StaffDirectory documents

family_directory
= stores FamilyDirectory documents
```

```text
Why only three collections?
---------------------------
- lightweight by design
- enough structure for resolution and classification
- easier to demo, maintain, and deploy than heavier multi-table or SDUI-style stacks
```

---

## school_events

`SchoolEventRecord = SchoolEventClassified + database storage fields`

```json
{
  "_id": "ObjectId",
  "source_system": "imap | whatsapp | school_portal",
  "source_channel": "mailbox | group_messaging | webhook",
  "sender_name": "string | null",
  "sender_contact": "string | null",
  "receivers": [
    "teacher_42",
    "admin_7"
  ],
  "subject": "string | null",
    "content": "string",
    "timestamp": "ISO-8601 string",
    "original_id": "string",
    "sender_group": "parent | teacher | admin | external | unknown",
  "category": "absence_report | action_request | deadline_or_form | administrative_notice | schedule_change | general",
  "urgent": true,
  "important": true,
  "action_required": true,
  "status": "new | handled | archived",
  "handled_by": "teacher_42 | admin_7 | null",
  "handled_at": "ISO-8601 string | null",
  "archived_by": "teacher_42 | admin_7 | null",
  "archived_at": "ISO-8601 string | null",
  "action_note": "string | null",
  "summary": "short operational summary",
  "received_at": "ISO-8601 string",
  "classified_at": "ISO-8601 string"
}
```

### Notes

```text
receivers
= resolved internal targets after the pre-classifier

urgent
= whether the event requires immediate handling

important
= whether the event deserves attention even if it is not immediately urgent

action_required
= whether the school should do something concrete after reading the event

status
= local dashboard state in v0: new, handled, or archived

handled_* / archived_*
= lightweight local audit fields for dashboard actions only

action_note
= optional note attached when a user marks an event as handled or archived

received_at
= when the pipeline ingested the event

classified_at
= when the classifier produced the final interpretation
```

---

## staff_directory

`StaffDirectory`

```json
{
  "_id": "ObjectId",
  "staff_id": "teacher_42",
  "name": "Maria Schmidt",
  "role": "teacher | admin",
  "contacts": [
    "maria.schmidt@school.de",
    "4917612345678"
  ],
  "aliases": [
    "Maria Schmidt",
    "Ms Schmidt",
    "Schmidt"
  ]
}
```

---

## family_directory

`FamilyDirectory`

```json
{
  "_id": "ObjectId",
  "family_id": "family_12",
  "parent_names": [
    "Nina Fischer"
  ],
  "parent_contacts": [
    "4917612345678",
    "nina.fischer@mail.de"
  ],
  "student_names": [
    "Emma Fischer"
  ],
  "aliases": [
    "Fischer family",
    "Emma Fischer",
    "Nina Fischer"
  ]
}
```

---

## Suggested Indexes

```javascript
db.school_events.createIndex({ urgent: 1, received_at: -1 })
db.school_events.createIndex({ important: 1, received_at: -1 })
db.school_events.createIndex({ category: 1, received_at: -1 })
db.school_events.createIndex({ source_channel: 1, received_at: -1 })
db.school_events.createIndex({ sender_group: 1, received_at: -1 })
db.school_events.createIndex({ status: 1, received_at: -1 })
db.school_events.createIndex({ original_id: 1 }, { unique: true })

db.staff_directory.createIndex({ staff_id: 1 }, { unique: true })
db.staff_directory.createIndex({ contacts: 1 })
db.staff_directory.createIndex({ aliases: 1 })

db.family_directory.createIndex({ family_id: 1 }, { unique: true })
db.family_directory.createIndex({ parent_contacts: 1 })
db.family_directory.createIndex({ aliases: 1 })
```

---

## Query Intuition

```text
staff_directory / family_directory
-> help resolve raw sender / receiver references

school_events
-> stores the final operational event used by dashboard and workflows
```

## Classification Choice

```text
Why an LLM classifier
---------------------
- no stable labeled dataset to train a dedicated model
- school communication patterns evolve quickly
- a fixed trained model would require frequent retraining
- an LLM gives faster adaptation in a changing domain
```
