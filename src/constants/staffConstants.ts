// ─────────────────────────────────────────────
// Staff Filter Options
// ─────────────────────────────────────────────
export const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

// ─────────────────────────────────────────────
// Staff Roles (common ones)
// ─────────────────────────────────────────────
export const STAFF_ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
 ] as const;

// ─────────────────────────────────────────────
// Table Column Headers
// ─────────────────────────────────────────────
export const STAFF_TABLE_COLUMNS = {
  NAME: 'Staff Member',
  EMAIL: 'Email',
  PHONE: 'Phone',
  ROLE: 'Role',
  STATUS: 'Status',
  ACTIONS: 'Actions',
} as const;

// ─────────────────────────────────────────────
// Status Filter Type
// ─────────────────────────────────────────────
export type StaffStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';