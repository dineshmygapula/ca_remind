import { STATUS_FILTER_OPTIONS, TASK_TYPE_FILTER_OPTIONS } from '@/constants/taskConstants';
import { ACTIVE_STATUS_FILTER_OPTIONS, AUTO_CREATE_FILTER_OPTIONS, CHANNEL_FILTER_OPTIONS, COMPLIANCE_TYPE_FILTER_OPTIONS, GST_STATUS_FILTER_OPTIONS, ROLE_FILTER_OPTIONS, SCHEDULE_FILTER_OPTIONS, WHEN_FILTER_OPTIONS } from './filterOptions';


export type FilterPageType = 'tasks' | 'taskrules' | 'reminders' | 'clients' | 'staff';

export interface FilterFieldOption {
    value: string;
    label: string;
}

export interface FilterFieldDef {
    /** key used both as the values-object key and the onChange(key, value) argument */
    key: string;
    label: string;
    options: readonly FilterFieldOption[];
}

// ─────────────────────────────────────────────
// The single place that defines which dropdowns
// each page gets. Add a new page by adding one
// entry here — nothing else needs to change.
// ─────────────────────────────────────────────
export const FILTER_FIELDS_BY_TYPE: Record<FilterPageType, FilterFieldDef[]> = {
    tasks: [
        { key: 'status', label: 'Status', options: STATUS_FILTER_OPTIONS },
        { key: 'taskType', label: 'Task Type', options: TASK_TYPE_FILTER_OPTIONS },
    ],
    taskrules: [
        { key: 'status', label: 'Status', options: STATUS_FILTER_OPTIONS },
        { key: 'schedule', label: 'Schedule', options: SCHEDULE_FILTER_OPTIONS },
        { key: 'autoCreate', label: 'Auto Create', options: AUTO_CREATE_FILTER_OPTIONS },
    ],
    reminders: [
        { key: 'when', label: 'When', options: WHEN_FILTER_OPTIONS },
        { key: 'status', label: 'Status', options: STATUS_FILTER_OPTIONS },
        { key: 'channel', label: 'Channel', options: CHANNEL_FILTER_OPTIONS },
    ],
    clients: [
        { key: 'status', label: 'Status', options: ACTIVE_STATUS_FILTER_OPTIONS },
        { key: 'gstStatus', label: 'GST Status', options: GST_STATUS_FILTER_OPTIONS },
        { key: 'complianceType', label: 'Compliance Type', options: COMPLIANCE_TYPE_FILTER_OPTIONS },
    ],
    staff: [
        { key: 'status', label: 'Status', options: ACTIVE_STATUS_FILTER_OPTIONS },
        { key: 'role', label: 'Role', options: ROLE_FILTER_OPTIONS },
    ],
};

export const SEARCH_PLACEHOLDER_BY_TYPE: Record<FilterPageType, string> = {
    tasks: 'Search tasks by title or client...',
    taskrules: 'Search task rules by name...',
    reminders: 'Search by task or client name...',
    clients: 'Search clients by name...',
    staff: 'Search staff by name or email...',
};

// Only Reminders shows the From/To date row today; flip a page to `true`
// here if it grows a date range later.
export const DATE_RANGE_ENABLED_BY_TYPE: Record<FilterPageType, boolean> = {
    tasks: false,
    taskrules: false,
    reminders: true,
    clients: false,
    staff: false,
};

/** Builds the default "ALL" values object for a page's filters, handy for useState init / reset. */
export function getDefaultFilterValues(type: FilterPageType): Record<string, string> {
    return FILTER_FIELDS_BY_TYPE[type].reduce<Record<string, string>>((acc, field) => {
        acc[field.key] = field.options[0]?.value ?? 'ALL';
        return acc;
    }, {});
}