export type ReminderStatus = "SCHEDULED" | "SENT" | "FAILED" | "CANCELLED";
export type ReminderChannel = "EMAIL" | "SMS" |  "WHATSAPP";
export type ReminderSource = "MANUAL" | "SYSTEM" | "SCHEDULED";

export interface ReminderTask {
  id: string;
  title: string;
  dueDate: string;
}

export interface ReminderSubject {
  id: string;
  name: string;
  type: string;
}

export interface Reminder {
  id: string;
  status: ReminderStatus;
  channel: ReminderChannel;
  scheduledAt: string;
  sentAt?: string | null;
  taskType?: string;
  task: ReminderTask;
  subject: ReminderSubject;
}
export interface RemindersListResponse {
  items: Reminder[];
  next_cursor: string | null;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status?: string;
  subjectId?: string;
}

export interface TasksListResponse {
  items: Task[];
  next_cursor?: string | null;
}

export interface Subject {
  id: string;
  name: string;
  subjectType: "CLIENT" | "STAFF" | string;
  isActive: boolean;
  email?: string;
  phone?: string;
}

export interface ReminderDefinition {
  id: string;
  name: string;
  description?: string;
  channel?: ReminderChannel;
  isActive?: boolean;
}

export interface ReminderDefinitionsListResponse {
  items: ReminderDefinition[];
  next_cursor?: string | null;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: ReminderChannel;
  body?: string;
  isActive?: boolean;
}

export interface MessageTemplatesListResponse {
  items: MessageTemplate[];
  next_cursor?: string | null;
}

export interface CreateReminderContext {
  [key: string]: unknown;
}

export interface CreateReminderPayload {
  taskId: string;
  reminderDefinitionId: string;
  reminderSource: ReminderSource;
  scheduledAt?: string;
  channel: ReminderChannel;
  targetUserId: string;
  messageTemplateId: string;
  context?: CreateReminderContext;
  sendNow: boolean;
}

export interface CreateReminderFormState {
  // Step 1 — Who
  targetUserId: string;

  // Step 2 — What task
  selectedTaskDefinitionId: string;  // drives matching, not sent to API
  taskId: string;                    // actual task instance id → goes to API
  taskName: string;                  // user-entered display name → NOT sent to API

  // Step 3 — Which reminder definition (auto-filled)
  reminderDefinitionId: string;

  // Step 4 — How to deliver (auto-filled from reminderDef)
  channel: ReminderChannel | "";
  messageTemplateId: string;

  // Step 5 — When
  sendNow: boolean;
  scheduledAt: string;

  // Fixed value
  frequency: string; 
  reminderSource: ReminderSource;
}

export interface SelectOption {
  value: string;
  label: string;
  meta?: Record<string, unknown>;
}

export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

// ─── Already existing in your file ───────────────────────────────────────────
// ReminderStatus, ReminderChannel, ReminderSource, Reminder, etc.
// ─────────────────────────────────────────────────────────────────────────────

// ─── ADD THESE ────────────────────────────────────────────────────────────────

export interface ReminderDetail {
  id: string;
  status: ReminderStatus;
  channel: ReminderChannel;
  scheduledAt: string;
  sentAt?: string | null;
  taskType?: string;
  task: ReminderTask;
  subject: ReminderSubject;
  reminderDefinitionId?: string;
  messageTemplateId?: string;
  targetUserId?: string;
  reminderSource?: ReminderSource;
  sendNow?: boolean;
  recipient?: {
    type?: string;
    value?: string;
  };
  message?: string;
  lastError?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateReminderPayload {
  scheduledAt?: string;
  status?: ReminderStatus;
}

export interface ListRemindersResponse {
  items: ReminderDetail[];
  next_cursor: string | null;
}

//15/5/26

export interface TaskDefinition {
  id: string;
  name: string;
  taskType?: string;
  subjectType?: string;
  isActive?: boolean;
}

export interface TaskDefinitionsListResponse {
  items: TaskDefinition[];
}

// ─── Default Form State ───────────────────────────────────────────────────────

export const DEFAULT_REMINDER_FORM: CreateReminderFormState = {
  targetUserId: "",
  selectedTaskDefinitionId: "",
  taskId: "",
  taskName: "",
  frequency: "ONETIME",
  reminderDefinitionId: "",
  channel: "",
  messageTemplateId: "",
  sendNow: true,
  scheduledAt: "",
  reminderSource: "MANUAL",
};
