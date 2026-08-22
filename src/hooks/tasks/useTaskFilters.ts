'use client';

import { useMemo, useState } from 'react';
import { TaskListItem } from '@/types/task.types';
import { getDefaultFilterValues } from '@/constants/filterFields';

export interface UseTaskFiltersResult {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    /** Matches PageFilterBar's `values` prop shape: { status: 'ALL', taskType: 'ALL' } */
    values: Record<string, string>;
    /** Matches PageFilterBar's `onChange(key, value)` signature */
    onChange: (key: string, value: string) => void;
    filteredTasks: TaskListItem[];
    reset: () => void;
}

/**
 * Owns search + dropdown filter state for the Tasks page, shaped to plug
 * straight into <PageFilterBar type="tasks" .../> without any adapting in
 * the page component.
 */
export function useTaskFilters(tasks: TaskListItem[]): UseTaskFiltersResult {
    const [searchQuery, setSearchQuery] = useState('');
    const [values, setValues] = useState<Record<string, string>>(() =>
        getDefaultFilterValues('tasks'),
    );

    const filteredTasks = useMemo(() => {
        let result = tasks;

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            result = result.filter(
                (t) =>
                    t.title?.toLowerCase().includes(q) ||
                    t.subject?.name?.toLowerCase().includes(q),
            );
        }

        if (values.status && values.status !== 'ALL') {
            result = result.filter((t) => t.status === values.status);
        }

        if (values.taskType && values.taskType !== 'ALL') {
            result = result.filter((t) => t.taskType === values.taskType);
        }

        return result;
    }, [tasks, searchQuery, values]);

    const onChange = (key: string, value: string) =>
        setValues((prev) => ({ ...prev, [key]: value }));

    const reset = () => {
        setSearchQuery('');
        setValues(getDefaultFilterValues('tasks'));
    };

    return { searchQuery, setSearchQuery, values, onChange, filteredTasks, reset };
}