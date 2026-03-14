# insight — Frontend API Spec

> Contract between n8n Dashboard API and the frontend team.
> Workflow ID: VzhY7mO07ROlNdpn — hosted on nextgen-n8n.westeurope.cloudapp.azure.com
> Last updated: 2026-03-13 [CLAUDE]

---

## Base URL

```
https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard
```

> For testing before Publish: use `/webhook-test/dashboard` (requires workflow in test mode)

---

## Endpoint

### GET /webhook/dashboard

Returns classified school events from MongoDB, optionally filtered.

#### Query Parameters

| Param      | Type    | Values                                              | Default |
|------------|---------|-----------------------------------------------------|---------|
| `urgent`   | boolean | `true`                                              | all     |
| `important`| boolean | `true`                                              | all     |
| `category` | string  | `absence_report` \| `action_request` \| `deadline_or_form` \| `administrative_notice` \| `schedule_change` \| `general` | all |
| `sender_group` | string | `parent` \| `teacher` \| `admin` \| `external` \| `unknown` | all |
| `source_system` | string | `imap` \| `whatsapp` \| `school_portal` | all |
| `source_channel` | string | `mailbox` \| `group_messaging` \| `webhook` | all |
| `limit`    | number  | 1–200                                               | 50      |

#### Example Requests

```bash
# All recent events (last 50)
GET /webhook/dashboard

# Only urgent events — for alert banner
GET /webhook/dashboard?urgent=true

# Absence reports for teacher view
GET /webhook/dashboard?category=absence_report&limit=20

# All WhatsApp group events
GET /webhook/dashboard?source_system=whatsapp&source_channel=group_messaging
```

---

## Response Shape

```json
{
  "success": true,
  "count": 12,
  "events": [
      {
        "_id": "...",
        "source_system": "whatsapp",
        "source_channel": "group_messaging",
        "sender_name": "Nina Fischer",
        "sender_contact": "4917612345678",
        "receivers": ["teacher_42", "admin_7"],
        "sender_group": "parent",
        "subject": null,
        "content": "Meine Tochter Emma ist heute krank...",
        "timestamp": "2026-03-13T08:10:00.000Z",
        "original_id": "3EB0C4A9F23B1D7E8A90",
        "category": "absence_report",
        "urgent": true,
        "important": true,
        "action_required": true,
        "summary": "Parent reports daughter absent due to illness — notify teacher.",
        "received_at": "2026-03-13T08:10:05.312Z",
        "classified_at": "2026-03-13T08:10:07.880Z"
      }
    ],
    "stats": {
      "urgent": 3,
      "important": 8,
      "by_category": {
        "absence_report": 5,
        "deadline_or_form": 4,
        "administrative_notice": 3
      }
    },
  "last_updated": "2026-03-13T18:45:00.000Z"
}
```

---

## Live Updates — Recommended Pattern (polling)

No WebSocket needed. Simple polling every 5 seconds:

```javascript
// vanilla JS — works anywhere
async function fetchDashboard(params = {}) {
  const url = new URL('https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook/dashboard');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res  = await fetch(url);
  const data = await res.json();
  return data;
}

// Auto-refresh every 5 seconds
let lastCount = 0;

setInterval(async () => {
  const data = await fetchDashboard({ limit: 50 });

  if (data.count !== lastCount) {
    // New events arrived — trigger your UI update + animation
    renderEvents(data.events);
    lastCount = data.count;
  }
}, 5000);
```

```javascript
// React hook version
function useDashboard(params = {}, intervalMs = 5000) {
  const [data, setData] = useState({ events: [], stats: {}, count: 0 });

  useEffect(() => {
    const load = async () => {
      const res = await fetchDashboard(params);
      setData(res);
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, []);

  return data;
}

// Usage
const { events, stats } = useDashboard({ urgent: 'true' });
```

---

## Dashboard Views — Suggested Queries per Role

```
  Teacher view:
    GET /webhook/dashboard?sender_group=teacher&limit=30

  Parent view:
    GET /webhook/dashboard?sender_group=parent&limit=20

  Administration view:
    GET /webhook/dashboard?sender_group=admin&limit=50

  Alert banner (top of screen):
    GET /webhook/dashboard?urgent=true&limit=10

Stats widgets (no events needed):
  GET /webhook/dashboard?limit=200
  → use response.stats directly
```

---

## CORS

All responses include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Cache-Control: no-cache
```

No auth needed — public read endpoint (hackathon scope).

---

## Status

- [ ] Set MongoDB credential on MongoDB Find node (same as main workflow)
- [ ] Publish workflow (activate via toggle)
- [ ] Share Base URL with frontend team
