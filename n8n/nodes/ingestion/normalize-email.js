/**
 * normalize-email.js
 * ==================
 * n8n Code node — wired after the IMAP mailbox trigger.
 *
 * INPUT
 *   Raw n8n IMAP email item.
 *
 * OUTPUT
 *   SchoolEvent (Normalized JSON)
 *   See fixtures/02_school_event_mailbox.json.
 */

const item = $input.first().json;
const now = new Date().toISOString();

const from = item.from?.value?.[0] ?? {};
const toList = Array.isArray(item.to?.value) ? item.to.value : [];
const receivers = toList
  .map((entry) => entry?.address)
  .filter(Boolean);

return [{
  json: {
    source_system: 'imap',
    source_channel: 'mailbox',
    sender_name: from.name ?? null,
    sender_contact: from.address ?? null,
    receivers,
    subject: item.subject ?? null,
    content: item.text ?? '',
    timestamp: item.date ?? now,
    original_id: item.messageId ?? `imap-${Date.now()}`,
  },
}];
