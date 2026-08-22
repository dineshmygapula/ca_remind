// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────
/* export type TaskStatus =
  | 'OPEN'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'; */

  // ✅ AFTER — add CLOSED, keep everything else
export type TaskStatus =
  | 'OPEN'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';
  // task.types.ts — confirm this line exists
/* export type StatusFilter =
  | 'ALL'
  | 'OPEN'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED'; */
  // In task.types.ts — add this
//export type StatusFilter = 'ALL' | 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';

export type TaskSource = 'MANUAL' | 'AUTO_GENERATED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type DeliveryChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';

// Constants (can be moved to a constants file)
//export const TASK_TYPES = ['GST', 'TDS', 'ROC', 'ITR', 'MSME'];

// ─────────────────────────────────────────────
// Nested Structures
// ─────────────────────────────────────────────
export interface TaskSubject {
  id: string;
  name: string;
  type?: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
}

export interface ReminderSchedule {
  deliveryChannel: DeliveryChannel;
  daysBeforeDueDate: number;
  messageTemplateId: string;
}

export interface TaskMetadata {
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// 1️⃣ List Tasks Response
// ─────────────────────────────────────────────
export interface TaskListItem {
  id: string;
  title: string;
  taskType?: string | null;
  status: TaskStatus;
  taskSource: TaskSource;
  dueDate: string;
  subject: TaskSubject;
  assignee: TaskAssignee | null;
}

export interface TasksListResponse {
  items: TaskListItem[];
  total?: number;
  next_cursor?: string | null;
}

export interface TaskReminder {
  id: string;
  reminderSource: string;
  status: string; // SENT, SCHEDULED, FAILED, CANCELLED
  channel: string; // WHATSAPP, EMAIL, SMS
  scheduledAt: string;
  sentAt?: string | null;
  recipient?: {
    type: string;
    value: string;
  };
}

export interface TaskResponse {
  id: string;
  title: string;

  taskType?: string | null;
  frequency?: string | null;
  periodLabel?: string | null;
  category?: string | null;

  status: TaskStatus;
  taskSource: TaskSource;

  dates: {
    dueDate: string;
    targetDate: string | null;
  };

  dueDate?: string;
  periodStart?: string | null;
  periodEnd?: string | null;

  subject: {
    id: string;
    name: string;
    type: string;
  };

  assignee: {
    id: string;
    name: string;
  } | null;

  reminders: {
    upcoming: TaskReminder[];
    sent: TaskReminder[];
    has_more: boolean;
  };

  notes?: string | null;
}

// ─────────────────────────────────────────────
// 3️⃣ Create Task Request
// ─────────────────────────────────────────────
/* export interface CreateTaskDto {
  title: string;
  taskName?: string;
  subjectId: string;
  dueDate: string;

  taskDefinitionId?: string;   // ← ADD
  taskType?: string | null;
  category?: string | null;
  description?: string;
  status?: string;             // ← ADD
  notes?: string;

  priority: TaskPriority;
  assignedUserId?: string;     // ← RENAME from assignedStaffId

  remindersScheduled?: ReminderSchedule[];
}
 */

// ─────────────────────────────────────────────
// Create Task Request — updated
// ─────────────────────────────────────────────
export interface CreateTaskDto {

  title?: string;
  taskName?: string;
  subjectId: string;
  dueDate: string;
  taskDefinitionId?: string;   // ← ADD
  taskType?: string | null;
  category?: string | null;
  description?: string;
  status?: string;             // ← ADD
  notes?: string;
  priority: TaskPriority;
  assignedStaffId?: string;     // ← renamed from assignedStaffId
  frequency?: string; // ← ADD for task frequency
  remindersScheduled?: ReminderSchedule[];
}
// ─────────────────────────────────────────────
// 4️⃣ Update Task Request
// ─────────────────────────────────────────────
export interface UpdateTaskDto {
  description?: string;
  notes?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedStaffId?: string;
  metadata?: TaskMetadata;
}

//to Create Reminder
export interface TaskInstance {
  id: string;
  title: string;
  dueDate: string;
  subjectId: string;
  status: string;
  taskDefinitionId: string;
}
