/**
 * Run API Smoke Tests
 *
 * Manual-only helper used inside "insight — Demo Viewer v1.0".
 * It performs real HTTP requests against the published API using
 * n8n's built-in $helpers.httpRequest.
 */

const baseUrl = 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook';

const tests = [
  {
    name: 'Brief for teacher staff_1',
    assertion: 'brief_teacher_staff_1',
    method: 'GET',
    url: `${baseUrl}/dashboard/brief?role=teacher&staff_id=staff_1`,
    expected: 'HTTP 200, personalized greeting for Sarah Lee, stats object present.',
  },
  {
    name: 'Brief for admin staff_4',
    assertion: 'brief_admin_staff_4',
    method: 'GET',
    url: `${baseUrl}/dashboard/brief?role=admin&staff_id=staff_4`,
    expected: 'HTTP 200, personalized greeting for David Brown.',
  },
  {
    name: 'Feed for teacher staff_1',
    assertion: 'feed_teacher_staff_1',
    method: 'GET',
    url: `${baseUrl}/dashboard/feed?role=teacher&staff_id=staff_1`,
    expected: 'HTTP 200 and at least one feed card for staff_1.',
  },
  {
    name: 'Feed filtered on absence_report',
    assertion: 'feed_absence_only',
    method: 'GET',
    url: `${baseUrl}/dashboard/feed?role=teacher&staff_id=staff_1&categories=absence_report`,
    expected: 'HTTP 200 and every returned item has category absence_report.',
  },
  {
    name: 'Detail for SEED-EVENT-0001',
    assertion: 'detail_seed_0001',
    method: 'GET',
    url: `${baseUrl}/dashboard/event?id=SEED-EVENT-0001`,
    expected: 'HTTP 200 and event detail for SEED-EVENT-0001.',
  },
  {
    name: 'Mark SEED-EVENT-0001 handled',
    assertion: 'action_handled',
    method: 'POST',
    url: `${baseUrl}/dashboard/action`,
    body: {
      event_id: 'SEED-EVENT-0001',
      action: 'handled',
      actor_id: 'staff_1',
      note: 'Handled during demo smoke test',
    },
    expected: 'HTTP 200 and action response with success=true and new_status=handled.',
  },
  {
    name: 'Detail after handled',
    assertion: 'detail_after_handled',
    method: 'GET',
    url: `${baseUrl}/dashboard/event?id=SEED-EVENT-0001`,
    expected: 'HTTP 200 and status handled on SEED-EVENT-0001.',
  },
  {
    name: 'Archive SEED-EVENT-0001',
    assertion: 'action_archive',
    method: 'POST',
    url: `${baseUrl}/dashboard/action`,
    body: {
      event_id: 'SEED-EVENT-0001',
      action: 'archive',
      actor_id: 'staff_1',
      note: 'Archived during demo smoke test',
    },
    expected: 'HTTP 200 and action response with success=true and new_status=archived.',
  },
  {
    name: 'Detail after archive',
    assertion: 'detail_after_archive',
    method: 'GET',
    url: `${baseUrl}/dashboard/event?id=SEED-EVENT-0001`,
    expected: 'HTTP 200 and status archived on SEED-EVENT-0001.',
  },
];

const results = [];

for (const test of tests) {
  let curl = `curl -sS '${test.url}' | jq`;
  if (test.method !== 'GET') {
    const payloadEscaped = JSON.stringify(test.body).replaceAll("'", "'\\''");
    curl = `curl -sS -X ${test.method} '${test.url}' -H 'Content-Type: application/json' -d '${payloadEscaped}' | jq`;
  }

  try {
    const request = {
      method: test.method,
      url: test.url,
      json: true,
      headers: { Accept: 'application/json' },
      resolveWithFullResponse: true,
      simple: false,
    };

    if (test.body) {
      request.body = test.body;
      request.headers['Content-Type'] = 'application/json';
    }

    const response = await $helpers.httpRequest(request);
    const statusCode = response.statusCode ?? null;
    const payload = response.body ?? null;

    let actual = 'Non-JSON response';
    if (payload && typeof payload === 'object') {
      if (typeof payload.greeting === 'string') {
        actual = `greeting=${payload.greeting}`;
      } else if (Array.isArray(payload.items)) {
        actual = `items=${payload.items.length}`;
      } else if (payload.id) {
        actual = `id=${payload.id}, status=${payload.status ?? 'unknown'}`;
      } else if (payload.event_id) {
        actual = `event_id=${payload.event_id}, action=${payload.action}, success=${payload.success}`;
      } else if (payload.error) {
        actual = `error=${payload.error}`;
      } else {
        actual = `keys=${Object.keys(payload).join(', ')}`;
      }
    }

    let pass = false;
    if (statusCode === 200) {
      switch (test.assertion) {
        case 'brief_teacher_staff_1':
          pass = typeof payload?.greeting === 'string' && payload.greeting.includes('Sarah Lee') && typeof payload?.stats?.urgent === 'number';
          break;
        case 'brief_admin_staff_4':
          pass = typeof payload?.greeting === 'string' && payload.greeting.includes('David Brown');
          break;
        case 'feed_teacher_staff_1':
          pass = Array.isArray(payload?.items) && payload.items.length > 0;
          break;
        case 'feed_absence_only':
          pass = Array.isArray(payload?.items) && payload.items.every((item) => item.category === 'absence_report');
          break;
        case 'detail_seed_0001':
          pass = payload?.id === 'SEED-EVENT-0001' && payload?.sender?.name === 'Jane Doe';
          break;
        case 'action_handled':
          pass = payload?.success === true && payload?.new_status === 'handled';
          break;
        case 'detail_after_handled':
          pass = payload?.id === 'SEED-EVENT-0001' && payload?.status === 'handled';
          break;
        case 'action_archive':
          pass = payload?.success === true && payload?.new_status === 'archived';
          break;
        case 'detail_after_archive':
          pass = payload?.id === 'SEED-EVENT-0001' && payload?.status === 'archived';
          break;
      }
    }

    results.push({
      name: test.name,
      method: test.method,
      url: test.url,
      curl,
      request_body: test.body ?? null,
      expected: test.expected,
      status_code: statusCode,
      pass,
      actual,
      response: payload,
    });
  } catch (error) {
    results.push({
      name: test.name,
      method: test.method,
      url: test.url,
      curl,
      request_body: test.body ?? null,
      expected: test.expected,
      status_code: null,
      pass: false,
      actual: `Request failed: ${error.message}`,
      response: { error: error.message },
    });
  }
}

const passed = results.filter((item) => item.pass).length;
const failed = results.length - passed;

return [
  {
    json: {
      generated_at: new Date().toISOString(),
      base_url: baseUrl,
      passed,
      failed,
      total: results.length,
      results,
    },
  },
];
