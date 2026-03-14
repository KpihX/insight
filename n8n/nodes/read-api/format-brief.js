/**
 * Format Brief
 *
 * Builds the compact dashboard summary returned by
 * GET /dashboard/brief.
 */

const req = $('GET /dashboard/brief').first().json;
const q = req.query ?? {};
const role = q.role ?? null;
const staffId = q.staff_id ?? null;
const rows = $input.all().map((item) => item.json);
const eventRows = rows.filter((row) => row.original_id);
const staffRows = rows.filter((row) => row.staff_id);

const statusRank = { archived: 3, handled: 2, new: 1 };

const timestampScore = (event) => {
  const candidates = [
    event.archived_at,
    event.handled_at,
    event.received_at,
    event.classified_at,
    event.timestamp,
  ]
    .filter(Boolean)
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value));

  return candidates.length > 0 ? Math.max(...candidates) : 0;
};

const chooseBetterEvent = (current, candidate) => {
  if (!current) return candidate;

  const currentRank = statusRank[current.status ?? 'new'] ?? 0;
  const candidateRank = statusRank[candidate.status ?? 'new'] ?? 0;

  if (candidateRank !== currentRank) {
    return candidateRank > currentRank ? candidate : current;
  }

  return timestampScore(candidate) >= timestampScore(current) ? candidate : current;
};

const eventMap = new Map();
for (const event of eventRows) {
  eventMap.set(event.original_id, chooseBetterEvent(eventMap.get(event.original_id), event));
}

const events = Array.from(eventMap.values());
const staff = staffRows.find((row) => !staffId || row.staff_id === staffId) ?? null;
const normalizeStatus = (event) => event.status ?? 'new';

const relevant = events
  .filter((event) => !staffId || (Array.isArray(event.receivers) && event.receivers.includes(staffId)))
  .filter((event) => normalizeStatus(event) !== 'archived');

const active = relevant.filter((event) => normalizeStatus(event) === 'new');
const urgent = active.filter((event) => event.urgent === true).length;
const important = active.filter((event) => event.important === true).length;
const deadlines = active.filter((event) => ['deadline_or_form', 'schedule_change'].includes(event.category)).length;

const focus = [];
if (urgent > 0) focus.push(`${urgent} urgent item${urgent > 1 ? 's' : ''} need attention.`);
if (deadlines > 0) focus.push(`${deadlines} deadline or schedule item${deadlines > 1 ? 's' : ''} require review.`);
if (important > urgent) {
  focus.push(`${important - urgent} additional important item${important - urgent > 1 ? 's' : ''} should stay visible today.`);
}

const greetingName = staff?.name ?? (role === 'admin' ? 'Admin' : null);

return [
  {
    json: {
      greeting: greetingName ? `Good morning, ${greetingName}.` : 'Good morning.',
      date_label: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      summary: `${active.length} item${active.length !== 1 ? 's' : ''} need your attention today.`,
      stats: { urgent, important, deadlines },
      focus: focus.slice(0, 3),
    },
  },
];
