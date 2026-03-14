/**
 * Render Smoke Report
 *
 * Turns the raw smoke-test execution into a readable markdown and HTML report.
 */

const data = $input.first().json;

const esc = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const reportMarkdown = [
  '# insight API smoke test report',
  '',
  `- Generated at: ${data.generated_at}`,
  `- Base URL: ${data.base_url}`,
  `- Passed: ${data.passed}/${data.total}`,
  `- Failed: ${data.failed}`,
  '',
  ...data.results.flatMap((result, index) => [
    `## ${index + 1}. ${result.name}`,
    '',
    `- Result: ${result.pass ? 'PASS' : 'FAIL'}`,
    `- Expected: ${result.expected}`,
    `- Actual: ${result.actual}`,
    `- HTTP status: ${result.status_code ?? 'request failed'}`,
    '- Request:',
    '```bash',
    result.curl,
    '```',
    '- Response:',
    '```json',
    JSON.stringify(result.response, null, 2),
    '```',
    '',
  ]),
].join('\n');

const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>insight API smoke test report</title>
  <style>
    :root { --bg:#f4f7fb; --card:#fff; --ink:#132238; --muted:#64748b; --line:#d8e1ec; --ok:#1b8a5a; --ko:#c63535; --brand:#0f62fe; }
    body { margin:0; font-family: ui-sans-serif, system-ui, sans-serif; background:linear-gradient(180deg,#eef4fb,#f9fbfd); color:var(--ink); }
    .wrap { max-width: 1180px; margin: 0 auto; padding: 32px 24px 64px; }
    .hero { background:linear-gradient(135deg,#0f62fe,#3aa0ff); color:#fff; border-radius:24px; padding:24px 28px; box-shadow:0 18px 48px rgba(15,98,254,.22); }
    .hero h1 { margin:0 0 10px; font-size:32px; }
    .hero p { margin:0; opacity:.92; }
    .stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin:24px 0; }
    .stat { background:var(--card); border:1px solid var(--line); border-radius:18px; padding:18px; box-shadow:0 8px 20px rgba(19,34,56,.06); }
    .label { color:var(--muted); font-size:14px; margin-bottom:8px; }
    .value { font-size:34px; font-weight:700; }
    .grid { display:grid; gap:16px; }
    .card { background:var(--card); border:1px solid var(--line); border-left:6px solid var(--brand); border-radius:18px; padding:18px; box-shadow:0 8px 20px rgba(19,34,56,.06); }
    .card.ok { border-left-color: var(--ok); }
    .card.ko { border-left-color: var(--ko); }
    .card-head { display:flex; justify-content:space-between; gap:10px; align-items:center; }
    .badge { border-radius:999px; padding:4px 10px; font-size:12px; font-weight:700; background:#edf4ff; color:var(--brand); }
    .ok .badge { background:#e9f8f0; color:var(--ok); }
    .ko .badge { background:#fdecec; color:var(--ko); }
    .muted { color:var(--muted); font-size:13px; }
    pre { white-space:pre-wrap; word-break:break-word; background:#0f172a; color:#e2e8f0; padding:14px; border-radius:12px; overflow:auto; }
    details { margin-top:10px; }
    summary { cursor:pointer; font-weight:600; }
    @media (max-width: 900px) { .stats { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>insight API smoke test report</h1>
      <p>Manual demo runner for the published API. It executes the real requests, compares them with the expected behavior, and records the current result.</p>
    </section>
    <section class="stats">
      <div class="stat"><div class="label">Passed</div><div class="value">${data.passed}</div></div>
      <div class="stat"><div class="label">Failed</div><div class="value">${data.failed}</div></div>
      <div class="stat"><div class="label">Generated at</div><div class="value" style="font-size:18px">${esc(data.generated_at)}</div></div>
    </section>
    <section class="grid">${data.results.map((result, index) => `
      <article class="card ${result.pass ? 'ok' : 'ko'}">
        <div class="card-head">
          <span class="badge">${result.pass ? 'PASS' : 'FAIL'}</span>
          <span class="muted">Test ${index + 1}</span>
        </div>
        <h3>${esc(result.name)}</h3>
        <p><strong>Expected:</strong> ${esc(result.expected)}</p>
        <p><strong>Actual:</strong> ${esc(result.actual)}</p>
        <p><strong>HTTP status:</strong> ${esc(result.status_code ?? 'request failed')}</p>
        <details>
          <summary>curl</summary>
          <pre>${esc(result.curl)}</pre>
        </details>
        <details>
          <summary>response</summary>
          <pre>${esc(JSON.stringify(result.response, null, 2))}</pre>
        </details>
      </article>`).join('')}</section>
  </div>
</body>
</html>`;

return [{ json: { ...data, report_markdown: reportMarkdown, report_html: reportHtml } }];
