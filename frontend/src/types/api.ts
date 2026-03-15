export interface CalendarPatch {
  should_render: boolean;
  patch_type?: 'meeting' | 'class' | 'reminder' | string;
  date?: string;
  start_time?: string;
  end_time?: string;
  title?: string;
  location?: string;
}

export interface EventAssist {
  calendar_patch: CalendarPatch;
}

export interface DashboardBrief {
  greeting: string;
  date_label: string;
  summary: string;
  stats: {
    urgent: number;
    important: number;
    deadlines: number;
  };
  focus: string[];
}

export interface DashboardFeedItem {
  id: string;
  category: string;
  urgent: boolean;
  important: boolean;
  action_required: boolean;
  title: string;
  summary: string;
  sender_label: string;
  time_label: string;
  status: string;
  primary_action?: string;
  secondary_action?: string;
  assist?: EventAssist;
}

export interface DashboardFeedResponse {
  items: DashboardFeedItem[];
}

export interface EventDetail {
  id: string;
  category: string;
  urgent: boolean;
  important: boolean;
  action_required: boolean;
  status: string;
  title: string;
  summary: string;
  sender: {
    name: string;
    group: string;
    contact: string;
  };
  receivers: string[];
  subject: string;
  content: string;
  timestamp: string;
  suggested_reply?: string;
  assist?: EventAssist;
  history: string[];
}
