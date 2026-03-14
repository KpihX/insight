# insight — Demo Data

## Raw files

### `raw/contact_list.json`

Original synthetic contact dataset received during the hackathon.

### `raw/email_100_records.json`

Original synthetic email dataset received during the hackathon.

These files are preserved as raw provenance.

## Canonical demo seeds

### `seed/staff_directory.json`

Operational seed for `staff_directory`.

### `seed/family_directory.json`

Operational seed for `family_directory`.

Important design decision:

```text
every parent in the demo seed has at least one child
```

That keeps the school data model coherent for demos and API tests.

## Seeding rule

The live demo baseline is defined by:

- these local seed JSON files,
- plus the inline `school_events_seed` records inside `insight — Demo Seed v1.0`.

The seed workflow is idempotent and uses business keys:

```text
staff_directory  -> staff_id
family_directory -> family_id
school_events    -> original_id
```
