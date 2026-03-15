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

const parseMailboxToken = (value) => {
  if (!value) return null;

  if (typeof value === 'object') {
    const address = value.address ?? value.email ?? null;
    const name = value.name ?? null;
    return address ? { name, address } : null;
  }

  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const angleMatch = trimmed.match(/^(.*?)(?:\s*)<([^>]+)>$/);
  if (angleMatch) {
    const rawName = angleMatch[1]?.trim().replace(/^"|"$/g, '') ?? '';
    const address = angleMatch[2]?.trim() ?? null;
    return address ? { name: rawName || null, address } : null;
  }

  if (trimmed.includes('@')) {
    return { name: null, address: trimmed };
  }

  return { name: trimmed, address: null };
};

const parseMailboxList = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((entry) => parseMailboxList(entry));
  }

  if (typeof value === 'object') {
    if (Array.isArray(value.value)) {
      return value.value
        .map((entry) => parseMailboxToken(entry))
        .filter((entry) => entry?.address);
    }

    const parsed = parseMailboxToken(value);
    return parsed?.address ? [parsed] : [];
  }

  if (typeof value === 'string') {
    return value
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((entry) => parseMailboxToken(entry))
      .filter((entry) => entry?.address);
  }

  return [];
};

const htmlToText = (value) => {
  if (typeof value !== 'string') return '';

  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

const content = [
  item.text,
  item.textPlain,
  item.plainText,
  htmlToText(item.textHtml),
  htmlToText(item.html),
]
  .find((value) => typeof value === 'string' && value.trim().length > 0)
  ?? '';

const from = parseMailboxList(item.from)[0] ?? parseMailboxToken(item.from) ?? {};
const receivers = parseMailboxList(item.to)
  .map((entry) => entry.address)
  .filter(Boolean);

return [{
  json: {
    source_system: 'imap',
    source_channel: 'mailbox',
    sender_name: from.name ?? null,
    sender_contact: from.address ?? null,
    receivers,
    subject: item.subject ?? null,
    content,
    timestamp: item.date ?? now,
    original_id: item.messageId ?? `imap-${Date.now()}`,
  },
}];
