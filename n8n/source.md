# insight — Source Layer

> Event-first trigger abstraction.

```text
                           SCHOOL INPUT SOURCES

    +------------------+     +--------------------------+     +----------------------+
     | EMAIL EVENTS     |     | MESSAGE EVENTS           |     | WEBHOOK / API        |
     |                  |     |                          |     | EVENTS               |
     | - IMAP mailbox   |     | - WhatsApp groups       |     | - school portal      |
     |                  |     |                          |     |                      |
     |                  |     |                          |     |                      |
    +------------------+     +--------------------------+     +----------------------+
             \                         |                                 /
              \                        |                                /
               \                       |                               /
                +-----------------------------------------------------+
                | Trigger / Adapter Layer                             |
                | - listen                                            |
                | - extract                                           |
                | - normalize                                          |
                +-----------------------------------------------------+
                                         |
                                         v
                            +------------------------------+
                            | SchoolEvent                  |
                            | (Normalized JSON)            |
                            +------------------------------+
                
```

```text
Current implementation focus
----------------------------
  - IMAP mailbox
  - WhatsApp groups
  - school portal webhook
```

```text
Demo mode
---------
  - one test email account
  - one WhatsApp group listener

Real school mode
----------------
  - one institutional IMAP mailbox
  - one or more school WhatsApp groups
  - one school portal webhook
```

## Trigger Layer

```text
TriggerEvent (Raw JSON)
├── MailboxEvent
├── GroupMessagingEvent
└── WebhookEvent
        |
        v
SchoolEvent (Normalized JSON)
```

## Trigger Output — SchoolEvent

```json
{
  "source_system": "imap | whatsapp | school_portal",
  "source_channel": "mailbox | group_messaging | webhook",
  "sender_name": "string | null",
  "sender_contact": "string | null",
  "receivers": [
    "email@school.de",
    "49123456789",
    "*",
    "teachers",
    "admin"
  ],
  "subject": "string | null",
  "content": "string",
  "timestamp": "ISO-8601 string",
  "original_id": "string"
}
```

```text
Receivers at source stage
-------------------------
`receivers` contains raw receiver references extracted from the trigger:
- email addresses
- messaging identifiers
- routing aliases

Alias conventions
-----------------
*         = all staff
teachers  = all teachers
admin     = administration / school life / secretariat
```

## Keywords

`event-first` `trigger abstraction` `TriggerEvent` `SchoolEvent` `MailboxEvent` `GroupMessagingEvent` `WebhookEvent` `group_messaging` `email events` `whatsapp group events` `school portal webhook events`
