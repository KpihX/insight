# insight — Internal Workflow Notes

## Workflow IDs

| Workflow | ID |
|----------|----|
| `insight — Ingestion v1.0` | `yBh4AiGZZCMmHTIg` |
| `insight — Read API v1.0` | `VzhY7mO07ROlNdpn` |
| `insight — Action API v1.0` | `CKI31nMRYztA59at` |
| `insight — Demo Seed v1.0` | `YYGMK0Nrstykk4Ok` |
| `insight — Demo Reset v1.0` | `t1Bk12b6l6zRuLot` |

## Important runtime conventions

### Manual-only workflows

These stay manual in hackathon mode:

- `insight — Ingestion v1.0`
- `insight — Demo Seed v1.0`
- `insight — Demo Reset v1.0`

### Published workflows

- `insight — Read API v1.0`
- `insight — Action API v1.0`

## Local source mapping

Inline workflow logic is now mirrored under [`nodes/`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes):

- [`nodes/ingestion/pack-staff-directory.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/pack-staff-directory.js)
- [`nodes/ingestion/pack-family-directory.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/pack-family-directory.js)
- [`nodes/ingestion/email-json-record.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/email-json-record.js)
- [`nodes/ingestion/msg-json-record.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/ingestion/msg-json-record.js)
- [`nodes/demo-seed/school-events-seed.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/demo-seed/school-events-seed.js)
- [`nodes/vector/default-data-loader-document.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/vector/default-data-loader-document.js)

### Default Data Loader document payload

The Qdrant branch loads one text document shaped like:

```text
School event
Category: <category>
Summary: <summary>
Content: <content>
Sender group: <sender_group>
Sender: <sender_name>
Source: <source_system> / <source_channel>
Receivers: <comma-separated receivers>
Timestamp: <timestamp>
```

with metadata:

- `event_id`
- `sender_group`
- `category`
- `source_system`
- `source_channel`
- `urgent`
- `important`
- `action_required`
- `receivers`
- `timestamp`

## Seed baseline events

The baseline seeded events are:

1. `SEED-EVENT-0001`
   - parent absence report from Jane Doe about Tim Doe
2. `SEED-EVENT-0002`
   - teacher schedule change from Sarah Lee
3. `SEED-EVENT-0003`
   - admin reminder from David Brown
