# insight — Demo Seed v1.0

Workflow ID: `YYGMK0Nrstykk4Ok`

## Purpose

Seed a clean baseline demo state into MongoDB.

## Triggers

- `Seed Demo Data`
- `Seed staff_directory only`
- `Seed family_directory only`
- `Seed school_events only`

## Persistence strategy

The workflow is intentionally idempotent:

```text
staff_directory  -> update key: staff_id
family_directory -> update key: family_id
school_events    -> update key: original_id
```

## Source of truth

The local JSON seed files are:

- [`../data/seed/staff_directory.json`](../data/seed/staff_directory.json)
- [`../data/seed/family_directory.json`](../data/seed/family_directory.json)

The workflow also contains an inline `school_events_seed` code node for the baseline demo events documented in [`../internal.md`](../internal.md).

Local source:

- [`../nodes/demo-seed/school-events-seed.js`](../nodes/demo-seed/school-events-seed.js)
