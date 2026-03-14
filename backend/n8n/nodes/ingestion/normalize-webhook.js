/**
 * normalize-webhook.js
 * ====================
 * n8n Code node — wired after a school portal webhook trigger.
 *
 * V0 note:
 *   The school portal path is part of the architecture contract,
 *   but email and WhatsApp group messaging remain the main demo focus.
 */

const item = $input.first().json;
const now = new Date().toISOString();

const receivers = Array.isArray(item.receivers) ? item.receivers.filter(Boolean) : [];

return [{
  json: {
    source_system: 'school_portal',
    source_channel: 'webhook',
    sender_name: item.sender_name ?? item.senderName ?? null,
    sender_contact: item.sender_contact ?? item.senderContact ?? null,
    receivers,
    subject: item.subject ?? null,
    content: item.content ?? item.message ?? '',
    timestamp: item.timestamp ?? now,
    original_id: item.original_id ?? item.originalId ?? `portal-${Date.now()}`,
  },
}];
