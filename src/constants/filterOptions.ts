import {
    SOURCE_FILTER_OPTIONS,
    FREQUENCY_OPTIONS,
    DELIVERY_CHANNELS,
} from '@/constants/taskConstants';

// ─────────────────────────────────────────────
// Generic Active/Inactive status — shared by
// Clients and Staff filter bars
// ─────────────────────────────────────────────
export const ACTIVE_STATUS_FILTER_OPTIONS = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
] as const;

// ─────────────────────────────────────────────
// GST Status (Clients)
// ⚠️ placeholder values — swap for your real enum
// ─────────────────────────────────────────────
export const GST_STATUS_FILTER_OPTIONS = [
    { value: 'ALL', label: 'All GST Status' },
    { value: 'REGISTERED', label: 'Registered' },
    { value: 'UNREGISTERED', label: 'Unregistered' },
    { value: 'COMPOSITION', label: 'Composition' },
    { value: 'CANCELLED', label: 'Cancelled' },
] as const;

// ─────────────────────────────────────────────
// Compliance Type (Clients)
// ⚠️ placeholder values — swap for your real enum
// ─────────────────────────────────────────────
export const COMPLIANCE_TYPE_FILTER_OPTIONS = [
    { value: 'ALL', label: 'All Compliance Types' },
    { value: 'GST', label: 'GST' },
    { value: 'TDS', label: 'TDS' },
    { value: 'ROC', label: 'ROC' },
    { value: 'ITR', label: 'ITR' },
    { value: 'MSME', label: 'MSME' },
] as const;

// ─────────────────────────────────────────────
// Role (Staff)
// ─────────────────────────────────────────────
export const ROLE_FILTER_OPTIONS = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
] as const;

// ─────────────────────────────────────────────
// When (Reminders) — matches "All Time" in screenshot
// ⚠️ placeholder values — swap for your real enum
// ─────────────────────────────────────────────
export const WHEN_FILTER_OPTIONS = [
    { value: 'ALL_TIME', label: 'All Time' },
    { value: 'TODAY', label: 'Today' },
    { value: 'THIS_WEEK', label: 'This Week' },
    { value: 'THIS_MONTH', label: 'This Month' },
    { value: 'OVERDUE', label: 'Overdue' },
] as const;

// ─────────────────────────────────────────────
// Schedule (Taskrules) — derived from FREQUENCY_OPTIONS
// so it stays in sync with the one source of truth
// ─────────────────────────────────────────────
export const SCHEDULE_FILTER_OPTIONS = [
    { value: 'ALL', label: 'All Schedules' },
    ...FREQUENCY_OPTIONS,
] as const;

// ─────────────────────────────────────────────
// Auto Create (Taskrules) — reuses SOURCE_FILTER_OPTIONS
// (MANUAL / AUTO_GENERATED) since that's the same concept
// ─────────────────────────────────────────────
export const AUTO_CREATE_FILTER_OPTIONS = SOURCE_FILTER_OPTIONS;

// ─────────────────────────────────────────────
// Channel (Reminders) — derived from DELIVERY_CHANNELS
// ─────────────────────────────────────────────
export const CHANNEL_FILTER_OPTIONS = [
    { value: 'ALL', label: 'All Channels' },
    ...DELIVERY_CHANNELS.map(({ value, label }) => ({ value, label })),
] as const;