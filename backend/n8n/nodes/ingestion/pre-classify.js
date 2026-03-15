/**
 * pre-classify.js
 * ===============
 * n8n Code node — resolves sender group and receiver references.
 *
 * EXPECTED INPUT SHAPE
 * {
 *   ...SchoolEvent,
 *   staff_directory:  StaffDirectory[],
 *   family_directory: FamilyDirectory[]
 * }
 *
 * OUTPUT
 *   SchoolEventPreclassified
 *   See fixtures/04_school_event_preclassified.json.
 */

const input = $input.first().json;
const {
  staff_directory: staffDirectory = [],
  family_directory: familyDirectory = [],
  ...event
} = input;

const normalize = (value) => String(value ?? '').trim().toLowerCase();
const timezone = 'Europe/Paris';

const parseEventDate = (value) => {
  const parsed = new Date(value ?? '');
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatTemporalContext = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'long',
  }).formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return {
    message_timestamp_utc: date.toISOString(),
    message_timestamp_local: `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')} ${timezone}`,
    reference_date: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
    reference_weekday: getPart('weekday'),
    timezone,
  };
};

const matchStaffByToken = (token) => {
  const needle = normalize(token);
  return staffDirectory.filter((staff) => {
    const contacts = Array.isArray(staff.contacts) ? staff.contacts : [];
    const aliases = Array.isArray(staff.aliases) ? staff.aliases : [];
    return [staff.staff_id, ...contacts, ...aliases].some((value) => normalize(value) === needle);
  });
};

const matchFamilyByToken = (token) => {
  const needle = normalize(token);
  return familyDirectory.filter((family) => {
    const parents = Array.isArray(family.parent_names) ? family.parent_names : [];
    const students = Array.isArray(family.student_names) ? family.student_names : [];
    const contacts = Array.isArray(family.parent_contacts) ? family.parent_contacts : [];
    const aliases = Array.isArray(family.aliases) ? family.aliases : [];
    return [family.family_id, ...parents, ...students, ...contacts, ...aliases].some((value) => normalize(value) === needle);
  });
};

const resolveSenderGroup = () => {
  const senderTokens = [event.sender_contact, event.sender_name].filter(Boolean);

  for (const token of senderTokens) {
    const staffMatches = matchStaffByToken(token);
    if (staffMatches.length > 0) {
      const roles = new Set(staffMatches.map((staff) => staff.role));
      if (roles.has('teacher')) return 'teacher';
      if (roles.has('admin')) return 'admin';
    }

    const familyMatches = matchFamilyByToken(token);
    if (familyMatches.length > 0) {
      const exactParent = familyMatches.some((family) => {
        const parentNames = Array.isArray(family.parent_names) ? family.parent_names : [];
        const parentContacts = Array.isArray(family.parent_contacts) ? family.parent_contacts : [];
        return [...parentNames, ...parentContacts].some((value) => normalize(value) === normalize(token));
      });
        if (exactParent) return 'parent';
        return 'parent';
    }
  }

  return senderTokens.length > 0 ? 'external' : 'unknown';
};

const resolveReceivers = () => {
  const tokens = Array.isArray(event.receivers) ? event.receivers : [];
  const resolved = new Set();

  for (const token of tokens) {
    const value = normalize(token);

    if (!value) continue;

    if (value === '*') {
      for (const staff of staffDirectory) {
        if (staff.staff_id) resolved.add(staff.staff_id);
      }
      continue;
    }

    if (value === 'teachers') {
      for (const staff of staffDirectory) {
        if (staff.role === 'teacher' && staff.staff_id) resolved.add(staff.staff_id);
      }
      continue;
    }

    if (value === 'admin') {
      for (const staff of staffDirectory) {
        if (staff.role === 'admin' && staff.staff_id) resolved.add(staff.staff_id);
      }
      continue;
    }

    const staffMatches = matchStaffByToken(token);
    for (const staff of staffMatches) {
      if (staff.staff_id) resolved.add(staff.staff_id);
    }

    if (staffMatches.length === 0) {
      resolved.add(token);
    }
  }

  return Array.from(resolved);
};

return [{
  json: {
    ...event,
    receivers: resolveReceivers(),
    sender_group: resolveSenderGroup(),
    received_at: new Date().toISOString(),
    temporal_context: formatTemporalContext(parseEventDate(event.timestamp)),
  },
}];
