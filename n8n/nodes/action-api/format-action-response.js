/**
 * Format Action Response
 *
 * Produces the stable response contract returned after a handled/archive
 * action against one school event.
 */

const request = $('Validate Action').first().json;
const updated = $input.first()?.json ?? {};
const found = Object.keys(updated).length > 0;

if (!found) {
  return [
    {
      json: {
        success: false,
        event_id: request.original_id,
        action: request.action,
        error: 'Event not found',
      },
    },
  ];
}

return [
  {
    json: {
      success: true,
      event_id: request.original_id,
      action: request.action,
      new_status: request.status,
    },
  },
];
