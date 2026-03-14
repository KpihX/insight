# insight — Internal Layer

> Internal processing from canonical event to database storage.

```text
                        INTERNAL PIPELINE

   +------------------------------+
    | SchoolEvent                  |
    | (Normalized JSON)            |
   +------------------------------+
                  |
                  v
    +-----------------------------------------------+
      | Pre-classifier                                |
      | - match sender / receivers                    |
      | - use internal staff directory                |
      | - use family directory                        |
      | - add sender_group                            |
      | - resolve receivers                           |
    +-----------------------------------------------+
                  |
                  v
     +-----------------------------------------------+
     | Classifier (LLM)                              |
     | - classify category                           |
     | - classify urgent                             |
     | - classify important                          |
     | - set action_required                         |
     | - generate summary                            |
     | - v1.1+ optional: read a lightweight memory note |
     +-----------------------------------------------+
                  |
                  v
   +-----------------------------------------------+
   | Database                                      |
   | - school_events                              |
   | - staff_directory                            |
   | - family_directory                           |
   +-----------------------------------------------+
```

```text
Directories used by the internal layer
--------------------------------------
  - staff_directory   : teachers / admin / aliases
  - family_directory  : parent contacts / student references / aliases

Population mode
---------------
- real school : sync from webhook / school system
- demo        : pre-filled manually
```

## Input From Source Layer — SchoolEvent

See `source.md` for the canonical `SchoolEvent` definition.

```text
Rule
----
At least one sender field must be present.
`receivers` should be present when available.
Aliases must be supported for school members.
```

## Output Of Pre-classifier

`SchoolEventPreclassified`

```json
{
  "source_system": "imap | whatsapp | school_portal",
  "source_channel": "mailbox | group_messaging | webhook",
  "sender_name": "string | null",
  "sender_contact": "string | null",
  "receivers": [
    "teacher_42",
    "teacher_51",
    "admin_7"
  ],
  "subject": "string | null",
  "content": "string",
  "timestamp": "ISO-8601 string",
  "original_id": "string",
  "sender_group": "parent | teacher | admin | external | unknown",
  "received_at": "ISO-8601 string"
}
```

```text
Pre-classifier role
-------------------
- resolve raw receiver references
- expand aliases such as `*`, `teachers`, `admin`
- map emails / messaging identifiers to internal identities
- rewrite `receivers` into resolved internal targets
```

## Output Of Classifier

`SchoolEventClassified`

```json
{
  "source_system": "imap | whatsapp | school_portal",
  "source_channel": "mailbox | group_messaging | webhook",
  "sender_name": "string | null",
  "sender_contact": "string | null",
  "receivers": [
    "teacher_42",
    "teacher_51",
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
  "summary": "short operational summary",
  "received_at": "ISO-8601 string",
  "classified_at": "ISO-8601 string"
}
```

```text
Classifier note
---------------
The LLM works on top of the resolved `receivers` field.
It classifies the event and may refine the operational interpretation,
but receiver resolution belongs to the pre-classifier.
The lightweight memory note is an optional future extension, not a V1 dependency.

Why LLM in V1
-------------
- no stable labeled dataset to train a dedicated model
- school communication patterns evolve too quickly
- a fixed trained model would require frequent retraining
- an LLM gives faster adaptation for a changing domain
```

## Keywords

`pre-classifier` `staff directory` `family directory` `sender_group` `receivers` `receiver resolution` `category` `urgent` `important` `db storage`
