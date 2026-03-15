# insight — Workflow Blueprints

This directory stores the reproducible blueprint of the shipped n8n setup.

The repository currently includes:

- local copies of the important Code node scripts,
- per-workflow topology documentation,
- workflow identifiers used on the online reference instance.

The online reference instance is:

```text
https://nextgen-n8n.westeurope.cloudapp.azure.com
```

## Workflow Inventory

| Workflow | ID | Mode |
|----------|----|------|
| `insight — Ingestion v1.0` | `yBh4AiGZZCMmHTIg` | manual |
| `insight — Read API v1.0` | `VzhY7mO07ROlNdpn` | published |
| `insight — Action API v1.0` | `CKI31nMRYztA59at` | published |
| `insight — Demo Seed v1.0` | `YYGMK0Nrstykk4Ok` | manual |
| `insight — Demo Reset v1.0` | `t1Bk12b6l6zRuLot` | manual |

Use the matching markdown blueprint in this directory together with the local Code node files under [`n8n/nodes/`](../nodes/).
