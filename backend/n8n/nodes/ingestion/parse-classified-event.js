/**
 * Parse Classified Event
 *
 * n8n Code node placed after the "Message a model" node.
 * It extracts the structured JSON payload returned by the model, merges it
 * with the pre-classified school event, and emits the final record shape
 * stored in MongoDB.
 */

const event = $('pre-classify').first().json;
const raw = $input.first().json;

const extractClassification = (payload) => {
  if (payload && typeof payload.category === 'string') return payload;

  const text = payload?.content?.parts?.[0]?.text ?? payload?.text ?? null;
  if (!text || typeof text !== 'string') return {};

  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
};

const classification = extractClassification(raw);
const meetingSignal = /\b(meeting|reunion)\b/i.test(`${event.subject ?? ''}\n${event.content ?? ''}`);
const mandatorySignal = /\b(mandatory|required|please attend)\b/i.test(`${event.subject ?? ''}\n${event.content ?? ''}`);
const extractedCalendarPatch = classification.assist?.calendar_patch ?? classification.calendar_patch ?? null;
const calendarPatch = extractedCalendarPatch && extractedCalendarPatch.should_render === true
  ? {
      should_render: true,
      patch_type: extractedCalendarPatch.patch_type ?? 'meeting',
      date: extractedCalendarPatch.date ?? null,
      start_time: extractedCalendarPatch.start_time ?? null,
      end_time: extractedCalendarPatch.end_time ?? null,
      title: extractedCalendarPatch.title ?? (event.subject ?? 'Meeting'),
    }
  : {
      should_render: false,
    };

return [
  {
    json: {
      ...event,
      category: classification.category && classification.category !== 'general'
        ? classification.category
        : (meetingSignal ? 'administrative_notice' : (classification.category ?? 'general')),
      urgent: Boolean(classification.urgent),
      important: Boolean(classification.important) || meetingSignal,
      action_required: Boolean(classification.action_required) || (meetingSignal && mandatorySignal),
      status: 'new',
      handled_by: null,
      handled_at: null,
      archived_by: null,
      archived_at: null,
      action_note: null,
      summary: classification.summary ?? 'No summary returned by classifier.',
      classified_at: new Date().toISOString(),
      assist: {
        calendar_patch: calendarPatch,
      },
    },
  },
];
