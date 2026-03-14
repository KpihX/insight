/**
 * normalize-wa.js
 * ===============
 * n8n Code node — wired after the WhatsApp webhook trigger.
 *
 * INPUT
 *   - Baileys / custom bridge payload
 *   - Meta WhatsApp Business payload
 *
 * OUTPUT
 *   SchoolEvent (Normalized JSON)
 *   See fixtures/03_school_event_group_messaging.json.
 */

const item = $input.first().json;
const now = new Date().toISOString();

let senderName = null;
let senderContact = null;
let content = '';
let timestamp = now;
let originalId = `wa-${Date.now()}`;
let groupId = null;

if (item.object === 'whatsapp_business_account') {
  const change = item.entry?.[0]?.changes?.[0]?.value ?? {};
  const message = change.messages?.[0] ?? {};
  const contact = change.contacts?.[0] ?? {};

  senderName = contact.profile?.name ?? null;
  senderContact = message.from ?? null;
  content = message.text?.body ?? '';
  timestamp = message.timestamp
    ? new Date(Number(message.timestamp) * 1000).toISOString()
    : now;
  originalId = message.id ?? originalId;
  groupId = message.context?.group_id ?? change.metadata?.display_phone_number ?? null;
} else {
  const raw = item.body ?? item;
  const seconds = Number(raw.timestamp ?? 0);

  senderName = raw.fromName ?? raw.pushName ?? null;
  senderContact = raw.from ?? null;
  content = raw.body ?? raw.text ?? '';
  timestamp = Number.isFinite(seconds) && seconds > 0
    ? new Date(seconds * 1000).toISOString()
    : now;
  originalId = raw.messageId ?? raw.key?.id ?? originalId;
  groupId = raw.remoteJid ?? raw.chatId ?? raw.key?.remoteJid ?? null;
}

const receivers = groupId ? [groupId] : [];

return [{
  json: {
    source_system: 'whatsapp',
    source_channel: 'group_messaging',
    sender_name: senderName,
    sender_contact: senderContact,
    receivers,
    subject: null,
    content,
    timestamp,
    original_id: originalId,
  },
}];
