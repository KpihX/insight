# insight — n8n Runtime

This directory is the local documentation and reconstruction layer for the shipped n8n-based system.

It documents:

- the live workflow inventory,
- the MongoDB schema and contracts,
- the source connectors,
- the final dashboard API,
- the local copies of important Code node scripts,
- the demo fixtures and seed data.

## Reference instance

The reference online instance used during the hackathon is:

```text
https://nextgen-n8n.westeurope.cloudapp.azure.com
```

## Canonical state

```text
Published
- insight — Read API v1.0
- insight — Action API v1.0

Manual
- insight — Ingestion v1.0
- insight — Demo Seed v1.0
- insight — Demo Reset v1.0
```

## Directory map

```text
n8n/
├── README.md
├── architecture.md
├── api.md
├── schema_db.md
├── internal.md
├── source.md
├── workflows/
├── nodes/
├── fixtures/
└── data/
```

## Where to start

1. [`architecture.md`](architecture.md) for the end-to-end flow
2. [`api.md`](api.md) for the public contract
3. [`schema_db.md`](schema_db.md) for the persistence model
4. [`workflows/`](workflows/) for per-workflow blueprints
5. [`nodes/README.md`](nodes/README.md) for local code-node mapping
