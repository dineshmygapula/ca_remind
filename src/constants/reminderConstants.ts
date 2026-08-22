import { ReminderChannel, ReminderSource, ReminderStatus } from "../types/reminders.types";

export const REMINDER_CHANNELS: ReminderChannel[] = [
  "EMAIL", "SMS",  "WHATSAPP",
];

export const REMINDER_CHANNEL_LABELS: Record<ReminderChannel, string> = {
  EMAIL:    "Email",
  SMS:      "SMS",
  WHATSAPP: "WhatsApp",
};

export const REMINDER_SOURCES: ReminderSource[] = [
  "MANUAL", "SYSTEM", "SCHEDULED",
];

export const REMINDER_SOURCE_LABELS: Record<ReminderSource, string> = {
  MANUAL:    "Manual",
  SYSTEM:    "System",
  SCHEDULED: "Scheduled",
};

// ─── ADD THESE ────────────────────────────────────────────────────────────────

export const REMINDER_STATUSES: ReminderStatus[] = [
  "SCHEDULED", "SENT", "FAILED", "CANCELLED",
];

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  SCHEDULED: "Scheduled",
  SENT:      "Sent",
  FAILED:    "Failed",
  CANCELLED: "Cancelled",
};

export const REMINDERS_PATH      = "reminders";
export const REMINDER_PATH       = "reminder";
export const REMINDERS_FAST_PATH = "reminders/fast";

// ─── ADD THESE ────────────────────────────────────────────────────────────────

export type ReminderStatusFilter = ReminderStatus | "ALL";
export type ReminderChannelFilter = ReminderChannel | "ALL";

export const STATUS_FILTER_OPTIONS: { value: ReminderStatusFilter; label: string }[] = [
  { value: "ALL",       label: "All Statuses" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "SENT",      label: "Sent" },
  { value: "FAILED",    label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const CHANNEL_FILTER_OPTIONS: { value: ReminderChannelFilter; label: string }[] = [
  { value: "ALL",       label: "All Channels" },
  { value: "EMAIL",     label: "Email" },
  { value: "SMS",       label: "SMS" },
  
  { value: "WHATSAPP",  label: "WhatsApp" },
];

// ─── Time Filter (Overdue / Today / Upcoming) ─────────────────────────────────

export type ReminderTimeFilter = "ALL" | "OVERDUE" | "TODAY" | "UPCOMING";

export const TIME_FILTER_OPTIONS: { value: ReminderTimeFilter; label: string }[] = [
  { value: "ALL",      label: "All Time" },
  { value: "OVERDUE",  label: "Overdue" },
  { value: "TODAY",    label: "Today" },
  { value: "UPCOMING", label: "Upcoming" },
];