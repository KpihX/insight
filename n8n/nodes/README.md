# insight — Local Code Node Sources

This directory stores the local source of the important logic embedded in the online n8n instance.

The goal is simple:

```text
clone repository
  -> open workflow blueprint
  -> copy matching local node script
  -> paste into n8n Code node
  -> rebuild without guessing
```

## Directory map

```text
nodes/
├── action-api/
├── demo-seed/
├── ingestion/
├── read-api/
├── vector/
└── legacy/
```

## Notes

- `action-api/`, `ingestion/`, and `read-api/` contain the shipped logic.
- `demo-seed/` contains the inline baseline event payloads that are seeded into MongoDB.
- `vector/` documents the `Default Data Loader` payload used before Qdrant insertion.
- `legacy/` preserves superseded logic for provenance only.
