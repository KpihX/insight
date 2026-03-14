# insight — Read API v1.0

Workflow ID: `VzhY7mO07ROlNdpn`

## Published routes

```text
GET /dashboard/brief
GET /dashboard/feed
GET /dashboard/event?id=...
```

## Topology

```text
GET /dashboard/brief -> MongoDB Find Brief + MongoDB Find Brief Staff -> Merge -> Format Brief -> Respond
GET /dashboard/feed  -> MongoDB Find Feed -> Format Feed -> Respond
GET /dashboard/event -> MongoDB Find Detail -> Format Detail -> Respond
```

## Code nodes

| Node | Local source |
|------|--------------|
| `Format Brief` | [`../nodes/read-api/format-brief.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/read-api/format-brief.js) |
| `Format Feed` | [`../nodes/read-api/format-feed.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/read-api/format-feed.js) |
| `Format Detail` | [`../nodes/read-api/format-detail.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/read-api/format-detail.js) |

## Operational note

The Read API deduplicates `school_events` by `original_id` and prefers the most meaningful state:

```text
archived > handled > new
```

If two rows share the same state rank, the most recent timestamp wins.
