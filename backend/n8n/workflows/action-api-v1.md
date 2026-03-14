# insight — Action API v1.0

Workflow ID: `CKI31nMRYztA59at`

## Published route

```text
POST /dashboard/action
```

## Body contract

```json
{
  "event_id": "SEED-EVENT-0001",
  "action": "handled",
  "actor_id": "staff_1",
  "note": "Handled during demo"
}
```

`action` supports:

- `handled`
- `archive`

## Topology

```text
POST /dashboard/action
  -> Validate Action
  -> MongoDB Update Action
  -> Format Action Response
  -> Respond Action
```

## Code nodes

| Node | Local source |
|------|--------------|
| `Validate Action` | [`../nodes/action-api/validate-action.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/action-api/validate-action.js) |
| `Format Action Response` | [`../nodes/action-api/format-action-response.js`](/home/kpihx/Work/AI/HiBrown/insight/backend/n8n/nodes/action-api/format-action-response.js) |
