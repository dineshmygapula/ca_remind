// ─────────────────────────────────────────────
// Task Status Options
// ─────────────────────────────────────────────
export const TASK_STATUS_OPTIONS = [
  { value: 'PENDING',     label: 'Pending',     color: '#64748b' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { value: 'COMPLETED',   label: 'Completed',   color: '#10b981' },
  { value: 'CANCELLED',   label: 'Cancelled',   color: '#ef4444' },
] as const;

// ─────────────────────────────────────────────
// Task Priority Options
// ─────────────────────────────────────────────
export const TASK_PRIORITY_OPTIONS = [
  { value: 'LOW',    label: 'Low',    color: '#64748b' },
  { value: 'MEDIUM', label: 'Medium', color: '#3b82f6' },
  { value: 'HIGH',   label: 'High',   color: '#f59e0b' },
  { value: 'URGENT', label: 'Urgent', color: '#ef4444' },
] as const;

// ─────────────────────────────────────────────
// Task Source Options
// ─────────────────────────────────────────────
export const TASK_SOURCE_OPTIONS = [
  { value: 'MANUAL',         label: 'Manual',         icon: '✍️' },
  { value: 'AUTO_GENERATED', label: 'Auto Generated', icon: '🤖' },
] as const;

// ─────────────────────────────────────────────
// Task Categories
// ─────────────────────────────────────────────
export const TASK_CATEGORIES = [
  'Compliance',
  'Tax Filing',
  'Registration',
  'Renewal',
  'Audit',
  'Documentation',
  'Payment',
  'Reporting',
  'Follow-up',
  'Other',
] as const;

// ─────────────────────────────────────────────
// Task Types
// ─────────────────────────────────────────────
export const TASK_TYPES = [
  {
    label: "GST",
    value: "GST_RETURN",
    apiValue: "GST",
    definitionName: "GST_GSTR3B_MONTHLY",
  },
  {
    label: "TDS",
    value: "TDS_RETURN",
    apiValue: "TDS",
    definitionName: "TDS_MONTHLY",
  },
  {
    label: "ROC",
    value: "ROC_FILING",
    apiValue: "ROC",
    definitionName: "ROC_ANNUAL",
  },
  {
    label: "ITR",
    value: "ITR_FILING",
    apiValue: "ITR",
    definitionName: "ITR_ANNUAL",
  },
  {
    label: "MSME",
    value: "MSME_RETURN",
    apiValue: "MSME",
    definitionName: "MSME_ANNUAL",
  },
  {
    label: "Payment Reminder",
    value: "PAYMENT_REMINDER",
    apiValue: "PAYMENT_REMINDER",
    definitionName: "PAYMENT_REMINDER",
  },
] as const;
// ─────────────────────────────────────────────
// Delivery Channels
// ─────────────────────────────────────────────
export const DELIVERY_CHANNELS = [
  { value: 'EMAIL',    label: 'Email',    icon: '📧' },
  { value: 'SMS',      label: 'SMS',      icon: '💬' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: '📱' },
] as const;

// ─────────────────────────────────────────────
// Filter Options
// ─────────────────────────────────────────────
export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL',         label: 'All Status'  },
  { value: 'OPEN',        label: 'Open'        },
  { value: 'PENDING',     label: 'Pending'     },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED',   label: 'Completed'   },
  { value: 'CLOSED',      label: 'Closed'      },
  { value: 'CANCELLED',   label: 'Cancelled'   },
] as const;

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'ALL',    label: 'All Priorities' },
  { value: 'URGENT', label: 'Urgent'         },
  { value: 'HIGH',   label: 'High'           },
  { value: 'MEDIUM', label: 'Medium'         },
  { value: 'LOW',    label: 'Low'            },
] as const;

export const SOURCE_FILTER_OPTIONS = [
  { value: 'ALL',            label: 'All Sources'   },
  { value: 'MANUAL',         label: 'Manual'        },
  { value: 'AUTO_GENERATED', label: 'Auto Generated'},
] as const;

// ─────────────────────────────────────────────
// Filter Types
// ─────────────────────────────────────────────
export type StatusFilter =
  | 'ALL'
  | 'OPEN'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export type PriorityFilter = 'ALL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SourceFilter   = 'ALL' | 'MANUAL' | 'AUTO_GENERATED';

// ─────────────────────────────────────────────
// Days Before Due Date (for reminders)
// ─────────────────────────────────────────────
export const DAYS_BEFORE_OPTIONS = [
  { value: 1,  label: '1 day before'  },
  { value: 2,  label: '2 days before' },
  { value: 3,  label: '3 days before' },
  { value: 5,  label: '5 days before' },
  { value: 7,  label: '7 days before' },
  { value: 10, label: '10 days before'},
  { value: 14, label: '14 days before'},
  { value: 30, label: '30 days before'},
] as const;

// ─────────────────────────────────────────────
// Task Definition (fetched from GET /task-definitions)
// ─────────────────────────────────────────────
export interface TaskDefinition {
  id: string;
  name: string;
  taskType: string;
  subjectType: string;
  isActive: boolean;
  priority: string;
  schedulePattern: string;
  dueDate: string;
}

export const TASK_TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 'GST', label: 'GST'       },
  { value: 'TDS', label: 'TDS'       },
  { value: 'ROC', label: 'ROC'       },
  { value: 'ITR', label: 'ITR'       },
  { value: 'MSME', label: 'MSME'     },
] as const;

export type TaskTypeFilter = 'ALL' | 'GST' | 'TDS' | 'ROC' | 'ITR' | 'MSME';





export const FREQUENCY_OPTIONS = [
  { value: "one_time",    label: "One-time" },
  { value: "monthly",     label: "Monthly" },
  { value: "quarterly",   label: "Quarterly" },
  { value: "half_yearly", label: "Half-Yearly" },
  { value: "yearly",      label: "Yearly" },
];
