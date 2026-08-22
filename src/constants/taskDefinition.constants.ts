// ─────────────────────────────────────────────
// Priority Options
// ─────────────────────────────────────────────
export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: '#64748b' },
  { value: 'MEDIUM', label: 'Medium', color: '#3b82f6' },
  { value: 'HIGH', label: 'High', color: '#f59e0b' },
  { value: 'URGENT', label: 'Urgent', color: '#ef4444' },
] as const;

// ─────────────────────────────────────────────
// Schedule Pattern Options
// ─────────────────────────────────────────────
export const SCHEDULE_PATTERNS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half-Yearly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One Time' },
] as const;

// ─────────────────────────────────────────────
// Subject Type Options
// ─────────────────────────────────────────────
export const SUBJECT_TYPE_OPTIONS = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'ALL', label: 'All' },
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
  'Other',
] as const;

// ─────────────────────────────────────────────
// Task Types (Common compliance tasks)
// ─────────────────────────────────────────────
export const TASK_TYPES = [
  'GST Return Filing',
  'TDS Return Filing',
  'Income Tax Return',
  'ROC Filing',
  'ESI Filing',
  'PF Filing',
  'MSME Registration',
  'License Renewal',
  'Audit Report',
  'Custom',
] as const;

// ─────────────────────────────────────────────
// Months
// ─────────────────────────────────────────────
export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
] as const;

// ─────────────────────────────────────────────
// Days (1-31)
// ─────────────────────────────────────────────
export const DAYS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}));

// ─────────────────────────────────────────────
// Generation Apply To
// ─────────────────────────────────────────────
export const GENERATION_APPLY_TO_OPTIONS = [
  { value: 'all_subjects_of_type', label: 'All Subjects of Type' },
  { value: 'specific_subjects', label: 'Specific Subjects' },
] as const;

// ─────────────────────────────────────────────
// Status Filter
// ─────────────────────────────────────────────
export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';