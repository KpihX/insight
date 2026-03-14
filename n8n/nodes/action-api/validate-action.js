/**
 * Validate Action
 *
 * Validates the request body for POST /dashboard/action and maps it to the
 * MongoDB update payload used by the Action API workflow.
 */

const req = $input.first().json;
const body = req.body ?? {};
const eventId = body.event_id ?? null;
const action = body.action ?? null;

if (!eventId) throw new Error('Missing event_id in request body.');
if (!['handled', 'archive'].includes(action)) throw new Error('Unsupported action.');
if (!body.actor_id) throw new Error('Missing actor_id in request body.');

const now = new Date().toISOString();

return [
  {
    json: {
      original_id: eventId,
      action,
      actor_id: body.actor_id,
      note: body.note ?? null,
      status: action === 'handled' ? 'handled' : 'archived',
      handled_by: action === 'handled' ? body.actor_id : null,
      handled_at: action === 'handled' ? now : null,
      archived_by: action === 'archive' ? body.actor_id : null,
      archived_at: action === 'archive' ? now : null,
      action_note: body.note ?? null,
    },
  },
];
