/**
 * gemini-classify.js
 * ==================
 * n8n Code node — wired after the pre-classifier.
 *
 * INPUT
 *   SchoolEventPreclassified
 *   See fixtures/04_school_event_preclassified.json.
 *
 * OUTPUT
 *   SchoolEventClassified
 *   See fixtures/05_school_event_classified.json.
 *
 * WHY LLM IN V1
 *   - no stable labeled dataset
 *   - school communication patterns evolve quickly
 *   - retraining a dedicated model would be costly and frequent
 */

const event = $input.first().json;
const apiKey = $vars.GEMINI_API_KEY;
const model = 'gemini-2.0-flash';
const memoryNote = $vars.CLASSIFIER_MEMORY_NOTE ?? '';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in n8n variables.');
}

const prompt = `
You are the classifier of a school communication pipeline called "insight".
You receive a SchoolEventPreclassified object and must return a SchoolEventClassified delta.

Event
- source_system: ${event.source_system}
- source_channel: ${event.source_channel}
- sender_name: ${event.sender_name ?? '(unknown)'}
- sender_contact: ${event.sender_contact ?? '(unknown)'}
- sender_group: ${event.sender_group}
- receivers: ${JSON.stringify(event.receivers ?? [])}
- subject: ${event.subject ?? '(none)'}
- content: ${event.content}

Optional lightweight memory note
${memoryNote || '(none)'}

Return only valid JSON with exactly these fields:
{
  "category": "absence_report" | "action_request" | "deadline_or_form" | "administrative_notice" | "schedule_change" | "general",
  "urgent": true | false,
  "important": true | false,
  "action_required": true | false,
  "summary": "short operational summary"
}

Classification guidance
- absence_report: absence, sickness, late arrival, student cannot attend.
- action_request: explicit ask to do something, answer something, validate something, intervene.
- deadline_or_form: form, signature, document, deadline, due date.
- administrative_notice: institutional or administrative information update.
- schedule_change: timetable change, cancellation, rescheduling, room or time update.
- general: any school-related message not matching the categories above.

urgent guidance
- true when the event should be handled immediately or on the same day.
- false otherwise.

important guidance
- true when the event deserves attention or follow-up even if it is not immediately urgent.
- false for low-attention informational events.

action_required guidance
- true when the school is expected to do something concrete after reading the event.
- false for purely informational events.
`;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 256,
      },
    }),
  },
);

if (!response.ok) {
  throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
}

const data = await response.json();
const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

let classification;
try {
  classification = JSON.parse(raw.replace(/```json|```/g, '').trim());
} catch (error) {
  throw new Error(`Gemini returned invalid JSON: ${raw}`);
}

return [{
    json: {
      ...event,
      category: classification.category ?? 'general',
      urgent: Boolean(classification.urgent),
      important: Boolean(classification.important),
      action_required: Boolean(classification.action_required),
      status: 'new',
      handled_by: null,
      handled_at: null,
      archived_by: null,
      archived_at: null,
      action_note: null,
      summary: classification.summary ?? 'No summary returned by classifier.',
      classified_at: new Date().toISOString(),
  },
}];
