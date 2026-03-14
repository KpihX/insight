# insight — API

> Lightweight frontend contract for the dashboard layer.
> We are lightweight: few routes, stable models, frontend-ready payloads.

---

## Base URL

```text
https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook
```

For test mode:

```text
https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook-test
```

---

## Routes

```text
GET  /dashboard/brief
GET  /dashboard/feed
GET  /dashboard/events/:id
POST /dashboard/events/:id/actions/:action
```

---

## Endpoints

### GET /dashboard/brief

Returns the top summary block for the connected staff member.

Query params:

```text
role   = teacher | admin
staff_id = teacher_42 | admin_7 | ...
```

Example request:

```text
GET /dashboard/brief?role=teacher&staff_id=teacher_42
```

Output:

```json
{
  "greeting": "Good morning, Sarah.",
  "date_label": "Friday, March 13",
  "summary": "3 items need your attention today.",
  "stats": {
    "urgent": 2,
    "important": 4,
    "deadlines": 2
  },
  "focus": [
    "2 absences still await teacher confirmation.",
    "1 permission slip deadline is tomorrow.",
    "1 schedule change affects your class planning."
  ]
}
```

Possible response:

```json
{
  "greeting": "Good morning, Sarah.",
  "date_label": "Saturday, March 14",
  "summary": "3 items need your attention today.",
  "stats": {
    "urgent": 1,
    "important": 2,
    "deadlines": 1
  },
  "focus": [
    "1 absence still awaits confirmation.",
    "1 permission slip deadline is due tomorrow.",
    "1 additional important item should stay visible today."
  ]
}
```

### GET /dashboard/feed

Query params:

```text
categories = absence_report | action_request | deadline_or_form | administrative_notice | schedule_change | general
             comma-separated list, optional
action_required = true | false, optional
limit  = 1..200
role   = teacher | admin
staff_id = teacher_42 | admin_7 | ...
```

Rules:

```text
- If categories is omitted, the API returns all relevant categories.
- If action_required is omitted, the API does not filter on action_required.
```

Example request:

```text
GET /dashboard/feed?categories=absence_report,deadline_or_form&action_required=true&role=teacher&staff_id=teacher_42&limit=20
```

```text
id in API responses = original_id exposed as the frontend event identifier
```

Output:

```json
{
  "items": [
    {
      "id": "evt_001",
      "category": "absence_report",
      "urgent": true,
      "important": true,
      "action_required": true,
      "title": "Liam A. — Absence confirmation (1A)",
      "summary": "Parent reported absence. Awaiting teacher confirmation.",
      "sender_label": "Parent Portal",
      "time_label": "09:40 AM",
      "status": "new",
      "primary_action": "Handled",
      "secondary_action": "Archive"
    }
  ]
}
```

Possible response:

```json
{
  "items": [
    {
      "id": "ACD199C7832583ED9D80542CEE1CC9",
      "category": "absence_report",
      "urgent": true,
      "important": true,
      "action_required": true,
      "title": "Rami Sanei — absence_report",
      "summary": "Parent reports a same-day student absence that needs quick handling.",
      "sender_label": "Parent Channel",
      "time_label": "12:48 PM",
      "status": "new",
      "primary_action": "Handled",
      "secondary_action": "Archive"
    },
    {
      "id": "portal_evt_20260314_001",
      "category": "deadline_or_form",
      "urgent": false,
      "important": true,
      "action_required": true,
      "title": "Grade 3 trip form deadline",
      "summary": "A school portal form deadline is tomorrow and still requires follow-up.",
      "sender_label": "School Channel",
      "time_label": "08:15 AM",
      "status": "new",
      "primary_action": "Handled",
      "secondary_action": "Archive"
    }
  ]
}
```

### GET /dashboard/events/:id

Returns the full detail view for one event.

Path params:

```text
id = event identifier
```

Example request:

```text
GET /dashboard/events/evt_001
```

```text
id = original_id exposed by the API
```

Output:

```json
{
  "id": "evt_001",
  "category": "absence_report",
  "urgent": true,
  "important": true,
  "action_required": true,
  "status": "new",
  "title": "Liam A. — Absence confirmation (1A)",
  "summary": "Parent reported absence. Awaiting teacher confirmation.",
  "sender": {
    "name": "Liam A. Family",
    "group": "parent",
    "contact": "family.portal@school.example"
  },
  "receivers": ["teacher_42", "admin_7"],
  "subject": "Absence confirmation",
  "content": "Hi, this is the Andersson family. Liam will not be attending school today due to illness.",
  "timestamp": "2026-03-13T09:40:00.000Z",
  "history": [
    "Form received",
    "AI classified",
    "Awaiting teacher"
  ]
}
```

Possible response:

```json
{
  "id": "ACD199C7832583ED9D80542CEE1CC9",
  "category": "absence_report",
  "urgent": true,
  "important": true,
  "action_required": true,
  "status": "new",
  "title": "Rami Sanei — absence_report",
  "summary": "Parent reports a same-day student absence that needs quick handling.",
  "sender": {
    "name": "raminsanei1992",
    "group": "parent",
    "contact": "230541379002563@lid"
  },
  "receivers": [
    "teacher_42",
    "admin_7"
  ],
  "subject": null,
  "content": "Hiii, my child will not attend school today because of illness.",
  "timestamp": "2026-03-14T12:48:25.000Z",
  "history": [
    "Event received",
    "AI classified",
    "Current status: new"
  ]
}
```

### POST /dashboard/events/:id/actions/:action

Supported actions:

```text
handled | archive
```

Path params:

```text
id     = event identifier
action = handled | archive
```

Example request:

```text
POST /dashboard/events/evt_001/actions/handled
```

Input:

```json
{
  "actor_id": "teacher_42",
  "note": "Handled and acknowledged."
}
```

Output:

```json
{
  "success": true,
  "event_id": "evt_001",
  "action": "handled",
  "new_status": "handled"
}
```

Possible response:

```json
{
  "success": true,
  "event_id": "ACD199C7832583ED9D80542CEE1CC9",
  "action": "handled",
  "new_status": "handled"
}
```

---

## Frontend Notes

```text
- Use polling first.
- Recommended refresh: every 10 to 20 seconds.
- Frontend should consume DashboardCard, not raw Mongo documents.
- API stays small on purpose: we are lightweight.
- v0 only updates our own database state. It does not push changes back to source systems.
```
