# insight — Demo Viewer v1.0

Workflow ID: `Jjx9BfZZS6uCH5kk`

## Purpose

Run manual smoke tests against the published API and generate a readable markdown / HTML report.

## Why it is manual

It is not a product route. It is an internal QA helper:

```text
manual trigger
  -> real HTTP requests against published API
  -> assertions
  -> report rendering
```

## Code nodes

| Node | Local source |
|------|--------------|
| `Run API Smoke Tests` | [`../nodes/demo-viewer/run-api-smoke-tests.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/demo-viewer/run-api-smoke-tests.js) |
| `Render Smoke Report` | [`../nodes/demo-viewer/render-smoke-report.js`](/home/kpihx/Work/AI/HiBrown/insight/n8n/nodes/demo-viewer/render-smoke-report.js) |
