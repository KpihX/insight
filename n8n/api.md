# insight — API

## Base URL

Production:

```text
https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook
```

Test mode:

```text
https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook-test
```

## Published routes

```text
GET  /dashboard/brief
GET  /dashboard/feed
GET  /dashboard/event?id=...
POST /dashboard/action
```

## 1. GET /dashboard/brief

### Query parameters

| Name | Type | Required | Example |
|------|------|----------|---------|
| `role` | `teacher | admin` | yes | `teacher` |
| `staff_id` | string | yes | `staff_1` |

### Example

```bash
curl -sS 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard/brief?role=teacher&staff_id=staff_1' | jq
```

### Response shape

```json
{
  "greeting": "Good morning, Sarah Lee.",
  "date_label": "Saturday, March 14",
  "summary": "1 item need your attention today.",
  "stats": {
    "urgent": 1,
    "important": 1,
    "deadlines": 1
  },
  "focus": [
    "1 urgent item need attention.",
    "1 deadline or schedule item require review."
  ]
}
```

## 2. GET /dashboard/feed

### Query parameters

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `role` | `teacher | admin` | yes | current viewer role |
| `staff_id` | string | yes | current actor |
| `categories` | CSV string | no | if omitted, all categories are considered |
| `action_required` | boolean-like | no | if omitted, no filter is applied |
| `limit` | integer | no | clamped to `1..200` |

### Example

```bash
curl -sS 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard/feed?role=teacher&staff_id=staff_1&categories=schedule_change&action_required=true&limit=10' | jq
```

### Response shape

```json
{
  "items": [
    {
      "id": "SEED-EVENT-0002",
      "category": "schedule_change",
      "urgent": true,
      "important": true,
      "action_required": true,
      "title": "Schedule change for tomorrow",
      "summary": "Sarah Lee reports a schedule change affecting Emma Smith and Lucas Garcia tomorrow morning.",
      "sender_label": "Sarah Lee",
      "time_label": "08:20 AM",
      "status": "new",
      "primary_action": "Handled",
      "secondary_action": "Archive"
    }
  ]
}
```

### Feed visibility rule

`archived` events are intentionally excluded from the feed.

```text
detail route -> can still read archived
feed route   -> hides archived
```

## 3. GET /dashboard/event

### Query parameters

| Name | Type | Required | Example |
|------|------|----------|---------|
| `id` | string | yes | `SEED-EVENT-0001` |

### Example

```bash
curl -sS 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard/event?id=SEED-EVENT-0001' | jq
```

### Response shape

```json
{
  "id": "SEED-EVENT-0001",
  "category": "absence_report",
  "urgent": false,
  "important": true,
  "action_required": false,
  "status": "archived",
  "title": "Jane Doe — absence_report",
  "summary": "Jane Doe reports that Tim Doe will be absent today.",
  "sender": {
    "name": "Jane Doe",
    "group": "parent",
    "contact": "+15559876543"
  },
  "receivers": ["staff_1", "staff_2", "staff_3"],
  "subject": null,
  "content": "Hello, Jane Doe here. Tim Doe will be absent today because he has a fever.",
  "timestamp": "2026-03-14T07:15:00.000Z",
  "history": [
    "Event received",
    "AI classified",
    "Current status: archived"
  ]
}
```

### Not found

```json
{
  "success": false,
  "error": "Event not found",
  "event_id": "DOES-NOT-EXIST"
}
```

## 4. POST /dashboard/action

### Request body

```json
{
  "event_id": "SEED-EVENT-0001",
  "action": "handled",
  "actor_id": "staff_1",
  "note": "Handled during demo"
}
```

Allowed `action` values:

- `handled`
- `archive`

### Example

```bash
curl -sS -X POST 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard/action' \
  -H 'Content-Type: application/json' \
  -d '{"event_id":"SEED-EVENT-0001","action":"handled","actor_id":"staff_1","note":"Handled during demo"}' | jq
```

### Response shape

```json
{
  "success": true,
  "event_id": "SEED-EVENT-0001",
  "action": "handled",
  "new_status": "handled"
}
```

## CORS policy

The published API responds with:

```text
Access-Control-Allow-Origin: *
Cache-Control: no-cache
```

Read routes allow:

```text
GET, OPTIONS
```

Action route allows:

```text
POST, OPTIONS
```
