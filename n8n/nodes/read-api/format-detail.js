/**
 * Format Detail
 *
 * Returns the canonical dashboard detail payload for one event.
 */

const req = $('GET /dashboard/event').first().json;
const eventId = req.query?.id ?? null;
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

const events = $input.all().map((item) => item.json).filter((event) => event.original_id);
const eventMap = new Map();
for (const event of events) {
  eventMap.set(event.original_id, chooseBetterEvent(eventMap.get(event.original_id), event));
}

const event = eventMap.get(eventId) ?? Array.from(eventMap.values()).find((item) => String(item._id ?? '') === String(eventId));

if (!event) {
  return [{ json: { success: false, error: 'Event not found', event_id: eventId } }];
}

return [
  {
    json: {
      id: event.original_id,
      category: event.category,
      urgent: Boolean(event.urgent),
      important: Boolean(event.important),
      action_required: Boolean(event.action_required),
      status: event.status ?? 'new',
      title: event.subject || `${event.sender_name ?? 'Unknown sender'} — ${event.category}`,
      summary: event.summary,
      sender: {
        name: event.sender_name,
        group: event.sender_group,
        contact: event.sender_contact,
      },
      receivers: event.receivers ?? [],
      subject: event.subject,
      content: event.content,
      timestamp: event.timestamp,
      history: [
        'Event received',
        'AI classified',
        `Current status: ${event.status ?? 'new'}`,
      ],
    },
  },
];
