/**
 * types.ts — Shared domain types for the school communication hub.
 *
 * Domain: school stakeholder ecosystem (Teachers, Parents, Secretariat, Students)
 * Core model: every school communication item is a SchoolMessage that can be
 * classified by the AI pipeline into a ClassifiedMessage.
 */

// ─── Input (raw communication items) ─────────────────────────────────────────

export type MessageChannel =
  | "email"
  | "short_chat"
  | "internal_mail"
  | "notification"
  | "letter"
  | "information_sheet"
  | "form"
  | "calendar_event"
  | "administrative_notice";

export interface SchoolMessage {
  id: string;
  channel: MessageChannel;
  subject: string;
  body: string;
  sender: string;
  timestamp: string; // ISO 8601
}

// ─── Classification output ────────────────────────────────────────────────────

export type MessageType =
  | "urgent"
  | "informational"
  | "action_required"
  | "event";

export type Audience =
  | "student"
  | "parent"
  | "teacher"
  | "secretariat"
  | "all";

export type Priority = "high" | "medium" | "low";

export interface Classification {
  type: MessageType;
  audience: Audience[];
  priority: Priority;
  summary: string;    // one-sentence AI-generated summary
  actionItems?: string[]; // extracted action items if type === "action_required"
}

export interface ClassifiedMessage {
  message: SchoolMessage;
  classification: Classification;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export type StakeholderRole = "student" | "parent" | "teacher" | "secretariat";

export interface DashboardView {
  role: StakeholderRole;
  items: ClassifiedMessage[];
}
