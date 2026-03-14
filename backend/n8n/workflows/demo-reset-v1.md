# insight — Demo Reset v1.0

Workflow ID: `t1Bk12b6l6zRuLot`

## Purpose

Delete the seeded demo data without touching workflow definitions.

## Triggers

- `Reset demo data`
- `Reset staff_directory`
- `Reset family_directory`
- `Reset school_events`

## Topology

```text
manual trigger
  -> Find *_ids
  -> Delete each row by _id
```

This approach is intentionally explicit and works reliably with the MongoDB node, unlike a fragile "delete everything" JSON query hack.
