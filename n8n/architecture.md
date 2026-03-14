# insight — n8n Architecture

> Event-first pipeline around `SchoolEvent`, `SchoolEventPreclassified`, and `SchoolEventClassified`.

```text
Competitive positioning
-----------------------
we are lightweight
- fewer moving parts
- faster to deploy inside real schools
- easier to understand than heavier dynamic UI architectures such as SDUI
```

## Core Graph

```text
                                      EVENT INGESTION

     +--------------------+         +------------------------+         +----------------------+
     | IMAP mailbox       |         | WhatsApp groups        |         | School portal        |
     | trigger            |         | webhook trigger        |         | webhook trigger      |
     +----------+---------+         +-----------+------------+         +----------+-----------+
                |                                 |                                 |
                v                                 v                                 v
     +--------------------+         +------------------------+         +----------------------+
     | normalize-email    |         | normalize-wa           |         | normalize-webhook    |
     | -> SchoolEvent     |         | -> SchoolEvent         |         | -> SchoolEvent       |
     +----------+---------+         +-----------+------------+         +----------+-----------+
                \                                 |                                 /
                 \                                |                                /
                  \_______________________________|_______________________________/
                                                  |
                                                  v
                                 +----------------------------------+
                                 | Merge Event Stream               |
                                 | one canonical event flow         |
                                 +----------------+-----------------+
                                                  |
                                                  v
                     +---------------------------------------------------------------+
                     | Read reference data from DB                                    |
                     | - staff_directory                                              |
                     | - family_directory                                             |
                     +-----------------------------+---------------------------------+
                                                   |
                                                   v
                                 +----------------------------------+
                                 | pre-classify                     |
                                 | -> SchoolEventPreclassified      |
                                 | - resolve receivers              |
                                 | - expand *, teachers, admin      |
                                 | - infer sender_group             |
                                 +----------------+-----------------+
                                                  |
                                                  v
                                 +----------------------------------+
                                 | Google Gemini                    |
                                 | Message a model                  |
                                 | -> classification JSON           |
                                 +----------------+-----------------+
                                                  |
                                                  v
                                 +----------------------------------+
                                 | Parse Classified Event           |
                                 | -> SchoolEventClassified         |
                                 | - category                       |
                                 | - urgent                         |
                                 | - important                      |
                                 | - action_required                |
                                 | - summary                        |
                                 | - v0 local status fields         |
                                 +----------------+-----------------+
                                                  |
                                                  v
                                 +----------------------------------+
                                 | MongoDB Save                     |
                                 | school_events                    |
                                 | -> SchoolEventRecord             |
                                 +----------------+-----------------+
                                                  |
                                                  v
                                 +----------------------------------+
                                 | Dashboard / operational reads    |
                                 | queries school_events            |
                                 +----------------------------------+
```

## Side Flow — Directory Hydration

```text
                              DIRECTORY HYDRATION

         +-----------------------+              +----------------------+
         | school portal sync    |              | demo seed / manual   |
         | webhook               |              | bootstrap            |
         +-----------+-----------+              +----------+-----------+
                     \                                     /
                      \                                   /
                       \_________________________________/
                                        |
                                        v
                     +-----------------------------------------------+
                     | Upsert reference collections                  |
                     | - staff_directory   (teachers / admin)        |
                     | - family_directory  (parents / students)      |
                     +-----------------------------------------------+
```

## Data Contracts In The Graph

```text
MailboxEvent / GroupMessagingEvent / WebhookEvent
-> SchoolEvent
-> SchoolEventPreclassified
-> SchoolEventClassified
-> SchoolEventRecord
```

## Database Touchpoints

```text
READS
- staff_directory
- family_directory

WRITES
- school_events
- staff_directory
- family_directory
```

## Why This Graph

```text
- one canonical event contract early
- one explicit receiver-resolution stage before LLM
- one final classified event written to the operational database
- no reminder / Discord branch in V0 core
- directory sync stays separate from event ingestion
- we are lightweight: this is a deliberate competitive advantage over heavier dynamic UI systems such as SDUI
```

## Node Inventory

```text
Normalizers
- nodes/normalize-email.js
- nodes/normalize-wa.js
- nodes/normalize-webhook.js

Internal processing
- nodes/pre-classify.js
- Google Gemini node in n8n
- Parse Classified Event (Code node in workflow)

Reference docs
- source.md
- internal.md
- schema_db.md
```
