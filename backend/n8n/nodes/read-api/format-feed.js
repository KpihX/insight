/**
 * Format Feed
 *
 * Applies role, staff, category, action_required, and limit filters to the
 * deduplicated school event list before returning dashboard cards.
 */

const req = $('GET /dashboard/feed').first().json;
const q = req.query ?? {};
const role = q.role ?? null;
const staffId = q.staff_id ?? null;

const monthNames = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
};

const toTwentyFourHour = (raw) => {
  if (!raw) return null;
  const match = String(raw).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2] ?? '00';
  const period = match[3].toUpperCase();

  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;

  return `${String(hour).padStart(2, '0')}:${minute}`;
};

const extractCalendarPatch = (event) => {
  const storedPatch = event.assist?.calendar_patch;
  if (storedPatch && storedPatch.should_render === true) {
    return {
      should_render: true,
      patch_type: storedPatch.patch_type ?? 'meeting',
      date: storedPatch.date ?? null,
      start_time: storedPatch.start_time ?? null,
      end_time: storedPatch.end_time ?? null,
      title: storedPatch.title ?? (event.subject ?? 'Meeting'),
    };
  }

  const subject = String(event.subject ?? '').trim();
  const content = String(event.content ?? '').trim();
  const haystack = `${subject}\n${content}`;
  const lower = haystack.toLowerCase();

  if (!/(meeting|reunion)/i.test(haystack)) {
    return { should_render: false };
  }

  const isRelevantCategory = ['administrative_notice', 'schedule_change', 'general'].includes(event.category);
  if (!isRelevantCategory) {
    return { should_render: false };
  }

  const dateMatch = haystack.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(\d{4})\b/i);
  const timeRangeMatch = haystack.match(/\bfrom\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\b/i);
  const atTimeMatch = haystack.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\b/i);

  if (!dateMatch) {
    return { should_render: false };
  }

  const month = monthNames[dateMatch[1].toLowerCase()];
  const day = String(Number(dateMatch[2])).padStart(2, '0');
  const year = dateMatch[3];
  const startTime = timeRangeMatch ? toTwentyFourHour(timeRangeMatch[1]) : toTwentyFourHour(atTimeMatch?.[1] ?? null);
  const endTime = timeRangeMatch ? toTwentyFourHour(timeRangeMatch[2]) : null;

  if (!month || !startTime) {
    return { should_render: false };
  }

  const title = subject || (lower.includes('administrative') ? 'Administrative meeting' : 'Meeting');

  return {
    should_render: true,
    patch_type: 'meeting',
    date: `${year}-${month}-${day}`,
    start_time: startTime,
    end_time: endTime,
    title,
  };
};

let limit = Number.parseInt(q.limit ?? '50', 10);
if (!Number.isFinite(limit)) limit = 50;
if (limit < 1) limit = 1;
if (limit > 200) limit = 200;

let categories = [];
if (Array.isArray(q.categories)) {
  categories = q.categories
    .flatMap((entry) => String(entry).split(','))
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
} else if (q.categories !== undefined && q.categories !== null && q.categories !== '') {
  categories = String(q.categories)
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

let actionRequiredFilter = null;
if (q.action_required !== undefined && q.action_required !== null && q.action_required !== '') {
  const normalized = String(q.action_required).trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) actionRequiredFilter = true;
  if (['false', '0', 'no'].includes(normalized)) actionRequiredFilter = false;
}

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
for (const event of $input.all().map((item) => item.json).filter((event) => event.original_id)) {
  eventMap.set(event.original_id, chooseBetterEvent(eventMap.get(event.original_id), event));
}

const relevant = [];
for (const event of Array.from(eventMap.values())) {
  const status = event.status ?? 'new';
  if (status === 'archived') continue;
  if (staffId && !(Array.isArray(event.receivers) && event.receivers.includes(staffId))) continue;
  if (categories.length > 0 && !categories.includes(event.category)) continue;
  if (actionRequiredFilter !== null && Boolean(event.action_required) !== actionRequiredFilter) continue;
  relevant.push(event);
}

relevant.sort((a, b) => timestampScore(b) - timestampScore(a));

const items = relevant.slice(0, limit).map((event) => {
  const calendarPatch = extractCalendarPatch(event);

  return {
    id: event.original_id,
    category: event.category,
    urgent: Boolean(event.urgent),
    important: Boolean(event.important),
    action_required: Boolean(event.action_required),
    title: event.subject || `${event.sender_name ?? 'Unknown sender'} — ${event.category}`,
    summary: event.summary,
    sender_label: event.sender_group === 'parent' ? 'Parent Channel' : (event.sender_name ?? role ?? 'School Channel'),
    time_label: new Date(event.timestamp ?? event.received_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: event.status ?? 'new',
    primary_action: 'Handled',
    secondary_action: 'Archive',
    assist: {
      calendar_patch: calendarPatch,
    },
  };
});

return [{ json: { items } }];
