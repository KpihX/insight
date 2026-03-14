import { DashboardBrief, DashboardFeedResponse, EventDetail } from '../types/api';
import { API_BASE_URL, USE_REAL_API } from '../config/runtime';

export { USE_REAL_API };

// --- MOCK DATA ---
const MOCK_BRIEF: DashboardBrief = {
  greeting: "Good morning, Ms. Müller.",
  date_label: "Saturday, March 14",
  summary: "3 items need your attention today.",
  stats: { urgent: 1, important: 2, deadlines: 1 },
  focus: [
    "1 absence still awaits confirmation.",
    "1 permission slip deadline is due tomorrow.",
    "1 additional important item should stay visible today."
  ]
};

const MOCK_FEED = [
  {
    id: "evt_001",
    category: "absence_report",
    urgent: true,
    important: true,
    action_required: true,
    title: "Liam A. — Absence confirmation (1A)",
    summary: "Parent reported absence. Awaiting teacher confirmation.",
    sender_label: "Parent Portal",
    time_label: "09:40 AM",
    status: "new",
    primary_action: "Handled",
    secondary_action: "Archive",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
  },
  {
    id: "evt_002",
    category: "deadline_or_form",
    urgent: false,
    important: true,
    action_required: true,
    title: "Grade 3 trip form deadline",
    summary: "A school portal form deadline is tomorrow and still requires follow-up.",
    sender_label: "School Channel",
    time_label: "08:15 AM",
    status: "new",
    primary_action: "Handled",
    secondary_action: "Archive",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
  },
  {
    id: "evt_003",
    category: "general",
    urgent: false,
    important: false,
    action_required: false,
    title: "Library opening hours update",
    summary: "The library will now open at 8:00 AM.",
    sender_label: "Gmail",
    time_label: "Yesterday",
    status: "read",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
  },
  {
    id: "evt_004",
    category: "action_request",
    urgent: true,
    important: true,
    action_required: true,
    title: "Mandatory administrative meeting on Monday, March 16 at 2:00 PM",
    summary: "Administration scheduled a mandatory coordination meeting for Sarah Lee.",
    sender_label: "Admin",
    time_label: "09:21 AM",
    status: "new",
    primary_action: "Handled",
    secondary_action: "Archive",
    assist: {
      calendar_patch: {
        should_render: true,
        patch_type: "meeting",
        date: "2026-03-16",
        start_time: "14:00",
        end_time: "15:00",
        title: "Mandatory administrative meeting",
      },
    },
  },
  {
    id: "evt_005",
    category: "action_request",
    urgent: false,
    important: true,
    action_required: true,
    title: "Call Mr. Doe regarding behavior",
    summary: "Parent requested a phone call to discuss recent events.",
    sender_label: "Email",
    time_label: "10:00 AM",
    status: "new",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
  },
  {
    id: "evt_006",
    category: "administrative_notice",
    urgent: false,
    important: false,
    action_required: true,
    title: "Review new curriculum guidelines",
    summary: "Please read and acknowledge the new guidelines for Q2.",
    sender_label: "Admin",
    time_label: "Yesterday",
    status: "new",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
  },
  {
    id: "evt_007",
    category: "general",
    urgent: false,
    important: false,
    action_required: true,
    title: "Sarah: Question about homework",
    summary: "Student asking for clarification on chapter 4.",
    sender_label: "Moodle",
    time_label: "11:30 AM",
    status: "new",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
  },
  {
    id: "evt_008",
    category: "schedule_change",
    urgent: false,
    important: true,
    action_required: true,
    title: "Reschedule 1B Biology class",
    summary: "Room 204 is double booked, need to find a new room.",
    sender_label: "Admin",
    time_label: "08:00 AM",
    status: "new",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
  }
];

const MOCK_DETAILS: Record<string, EventDetail> = {
  "evt_001": {
    id: "evt_001",
    category: "absence_report",
    urgent: true,
    important: true,
    action_required: true,
    status: "new",
    title: "Liam A. — Absence confirmation (1A)",
    summary: "Parent reported absence. Awaiting teacher confirmation.",
    sender: { name: "Liam A. Family", group: "parent", contact: "family.portal@school.example" },
    receivers: ["teacher_42", "admin_7"],
    subject: "Absence confirmation",
    content: "Hi, this is the Andersson family. Liam will not be attending school today due to illness.",
    timestamp: "2026-03-14T09:40:00.000Z",
    suggested_reply: "Thank you for letting us know. We have registered Liam's absence for today. Wishing him a speedy recovery!",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
    history: ["Form received", "AI classified", "Awaiting teacher"]
  },
  "evt_002": {
    id: "evt_002",
    category: "deadline_or_form",
    urgent: false,
    important: true,
    action_required: true,
    status: "new",
    title: "Grade 3 trip form deadline",
    summary: "A school portal form deadline is tomorrow and still requires follow-up.",
    sender: { name: "School Admin", group: "admin", contact: "admin@school.example" },
    receivers: ["teacher_42"],
    subject: "Trip form deadline",
    content: "Please ensure all permission slips for the Grade 3 trip are collected by tomorrow.",
    timestamp: "2026-03-14T08:15:00.000Z",
    suggested_reply: "I will remind the students today and ensure all slips are collected by tomorrow.",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
    history: ["Notice sent", "AI classified"]
  },
  "evt_003": {
    id: "evt_003",
    category: "general",
    urgent: false,
    important: false,
    action_required: false,
    status: "read",
    title: "Library opening hours update",
    summary: "The library will now open at 8:00 AM.",
    sender: { name: "Librarian", group: "staff", contact: "library@school.example" },
    receivers: ["all_staff"],
    subject: "New Library Hours",
    content: "Dear staff, starting next week, the library will open at 8:00 AM instead of 8:30 AM.",
    timestamp: "2026-03-13T15:00:00.000Z",
    assist: {
      calendar_patch: {
        should_render: false,
      },
    },
    history: ["Email received"]
  },
  "evt_004": {
    id: "evt_004",
    category: "action_request",
    urgent: true,
    important: true,
    action_required: true,
    status: "new",
    title: "Mandatory administrative meeting on Monday, March 16 at 2:00 PM",
    summary: "Administration scheduled a mandatory coordination meeting for Sarah Lee.",
    sender: { name: "David Brown", group: "admin", contact: "david.brown@school.example" },
    receivers: ["staff_1"],
    subject: "Mandatory administrative meeting for staff_1",
    content: "Hello Sarah, there is a mandatory administrative meeting scheduled for Monday, March 16, 2026 from 2:00 PM to 3:00 PM in Room 204. We will review the teacher dashboard brief and the action-required items for staff_1.",
    timestamp: "2026-03-14T09:21:00.000Z",
    suggested_reply: "Received. I will attend the administrative meeting on Monday at 2:00 PM.",
    assist: {
      calendar_patch: {
        should_render: true,
        patch_type: "meeting",
        date: "2026-03-16",
        start_time: "14:00",
        end_time: "15:00",
        title: "Mandatory administrative meeting",
      },
    },
    history: ["Email received", "AI classified", "Calendar patch extracted"]
  }
};

// --- API METHODS ---

export async function getDashboardBrief(role: string, staffId: string): Promise<DashboardBrief> {
  if (!USE_REAL_API) return MOCK_BRIEF;
  
  const res = await fetch(`${API_BASE_URL}/dashboard/brief?role=${role}&staff_id=${staffId}`);
  if (!res.ok) throw new Error('Failed to fetch brief');
  return res.json();
}

export async function getDashboardFeed(
  role: string, 
  staffId: string, 
  categories?: string, 
  action_required?: boolean, 
  limit = 20
): Promise<DashboardFeedResponse> {
  if (!USE_REAL_API) {
    let items = [...MOCK_FEED];
    if (action_required !== undefined) {
      items = items.filter(i => i.action_required === action_required);
    }
    if (categories) {
      const cats = categories.split(',');
      items = items.filter(i => cats.includes(i.category));
    }
    return { items: items.slice(0, limit) };
  }

  let url = `${API_BASE_URL}/dashboard/feed?role=${role}&staff_id=${staffId}&limit=${limit}`;
  if (categories) url += `&categories=${categories}`;
  if (action_required !== undefined) url += `&action_required=${action_required}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch feed');
  return res.json();
}

export async function getEventDetail(id: string): Promise<EventDetail> {
  if (!USE_REAL_API) {
    if (MOCK_DETAILS[id]) return MOCK_DETAILS[id];
    throw new Error('Event not found in mock data');
  }

  const res = await fetch(`${API_BASE_URL}/dashboard/event?id=${id}`);
  if (!res.ok) throw new Error('Failed to fetch event detail');
  return res.json();
}

export async function postEventAction(id: string, action: string, actorId: string, note?: string): Promise<any> {
  if (!USE_REAL_API) {
    return { success: true, event_id: id, action, new_status: action };
  }

  const res = await fetch(`${API_BASE_URL}/dashboard/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_id: id, action, actor_id: actorId, note }),
  });
  if (!res.ok) throw new Error('Failed to post action');
  return res.json();
}
