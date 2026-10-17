'use client';

import { useCallback, useEffect, useState } from 'react';
import { getTasks, deleteTask } from '@/services/taskService';
import { TaskListItem } from '@/types/task.types';

export interface UseTasksResult {
    tasks: TaskListItem[];
    loading: boolean;
    error: string;
    setError: (message: string) => void;
    refetch: () => Promise<void>;
    removeTask: (taskId: string) => Promise<void>;
    deleteLoading: boolean;
}

/**
 * Owns everything data-related for the Tasks page: fetching, refetching after
 * mutations, and deleting. The page component only ever reads state and calls
 * `refetch`/`removeTask` — it never touches taskService directly.
 */
export function useTasks(businessId: string | null | undefined): UseTasksResult {
    const [tasks, setTasks] = useState<TaskListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const refetch = useCallback(async () => {
        if (!businessId) return;
        try {
            setLoading(true);
            setError('');
            const data = await getTasks(businessId);
            setTasks(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (businessId) refetch();
    }, [businessId]);

    const removeTask = useCallback(
        async (taskId: string) => {
            if (!businessId) return;
            try {
                setDeleteLoading(true);
                setError('');
                await deleteTask(businessId, taskId);
                await refetch();
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to delete task');
                throw err; // let the caller know the delete didn't go through
            } finally {
                setDeleteLoading(false);
            }
        },
        [businessId],



    );

    return { tasks, loading, error, setError, refetch, removeTask, deleteLoading };
}