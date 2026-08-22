// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SchedulePattern = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'one_time';
export type GenerationApplyTo = 'all_subjects_of_type' | 'specific_subjects';

// ─────────────────────────────────────────────
// Schedule Rules
// ─────────────────────────────────────────────
export interface MonthlySchedule {
  day: number;
}

export interface QuarterlySchedule {
  q1Month: number;
  q1Day: number;
  q2Month: number;
  q2Day: number;
  q3Month: number;
  q3Day: number;
  q4Month: number;
  q4Day: number;
}

export interface HalfYearlySchedule {
  firstHalf: {
    month: number;
    day: number;
  };
  secondHalf: {
    month: number;
    day: number;
  };
}

export interface YearlySchedule {
  month: number;
  day: number;
}

export interface OneTimeSchedule {
  dueDate: string;
}

export interface ScheduleRule {
  pattern: SchedulePattern;
  monthly?: MonthlySchedule;
  quarterly?: QuarterlySchedule;
  halfYearly?: HalfYearlySchedule;
  yearly?: YearlySchedule;
  oneTime?: OneTimeSchedule;
}

// ─────────────────────────────────────────────
// Generation Rule
// ─────────────────────────────────────────────
export interface GenerationRule {
  applyTo: GenerationApplyTo;
  specificSubjectIds?: string[];
}

// ─────────────────────────────────────────────
// Metadata Template
// ─────────────────────────────────────────────
export type MetadataTemplate = Record<string, unknown>;

// ─────────────────────────────────────────────
// Reminder Item (nested in TaskDefinition)
// ✅ Moved ABOVE TaskDefinition so it can be referenced
// ─────────────────────────────────────────────
export interface ReminderItem {
  id: string;
  businessId: string;
  taskDefinitionId: string;
  name: string;
  channel: 'IN_APP' | string;
  offsetDays: number;
  messageTemplateId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// 1️⃣ List TaskDefinitions Response
// ─────────────────────────────────────────────
export interface TaskDefinitionListItem {
  id: string;
  name: string;
  taskType: string;
  subjectType: string;
  isActive: boolean; 
  autoCreateTasks?: boolean;
  autoCreateReminders?: boolean;
  priority: TaskPriority;
  schedulePattern: SchedulePattern;
  scheduleRule: ScheduleRule;
  dueDate?: string;
}

export interface TaskDefinitionsListResponse {
  items: TaskDefinitionListItem[];
}

// ─────────────────────────────────────────────
// 2️⃣ Get TaskDefinition by ID Response
// ─────────────────────────────────────────────
export interface TaskDefinition {
  id: string;
  businessId: string;
  name: string;
  taskType: string;
  description?: string;
  category?: string;
  subjectType: string;
  isActive: boolean;
  autoCreateTasks?: boolean;
  autoCreateReminders?: boolean;
  priority: TaskPriority;
  titleTemplate?: string;
  descriptionTemplate?: string;
  scheduleRule: ScheduleRule;
  targetOffsetDays?: number;
  generationRule?: GenerationRule;
  metadataTemplate?: MetadataTemplate;
  dueDate?: string;
  taskInstanceTriggerDate?: string;
  lastDueDate?: string;
  lastProcessedAt?: string;
  reminders?: ReminderItem[];   // ✅ NEW — from updated GET-by-ID API
}

// ─────────────────────────────────────────────
// 3️⃣ Create TaskDefinition Request
// ─────────────────────────────────────────────
export interface CreateTaskDefinitionDto {
  name: string;
  taskType: string;
  description?: string;
  category?: string;
  subjectType: string;
  isActive: boolean;
  autoCreateTasks?: boolean;
  autoCreateReminders?: boolean;
  priority: TaskPriority;
  titleTemplate?: string;
  descriptionTemplate?: string;
  scheduleRule: ScheduleRule;
  targetOffsetDays?: number;
  generationRule?: GenerationRule;
  metadataTemplate?: MetadataTemplate;
}

// ─────────────────────────────────────────────
// 4️⃣ Update TaskDefinition Request
// ─────────────────────────────────────────────
export interface UpdateTaskDefinitionDto {
  name?: string;
  taskType?: string;
  description?: string;
  category?: string;
  subjectType?: string;
  isActive?: boolean;
  autoCreateTasks?: boolean;
  autoCreateReminders?: boolean;
  priority?: TaskPriority;
  titleTemplate?: string;
  descriptionTemplate?: string;
  scheduleRule?: ScheduleRule;
  targetOffsetDays?: number;
  generationRule?: GenerationRule;
  metadataTemplate?: MetadataTemplate;
}

// ─────────────────────────────────────────────
// 5️⃣ Reminder Definition (from v2reminderdefinitions)
// ─────────────────────────────────────────────
export type ReminderChannel = 'IN_APP' | 'EMAIL' | 'SMS' | string;

export interface ReminderDefinition {
  id: string;
  businessId: string;
  taskDefinitionId: string;
  name: string;
  channel: ReminderChannel;
  offsetDays: number;
  messageTemplateId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderDefinitionsListResponse {
  items: ReminderDefinition[];
}