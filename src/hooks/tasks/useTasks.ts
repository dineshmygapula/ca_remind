'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getTasks, deleteTask } from '@/services/taskService';
import { TaskListItem } from '@/types/task.types';

export interface UseTasksResult {
    tasks: TaskListItem[];
    loading: boolean;
    error: string;
    setError: (message: string) => void;
    refetch: () => Promise<void>;
    removeTask: (taskId: string) => Promise<void>;
    patchTask: (taskId: string, patch: Partial<TaskListItem>) => void;
    deleteLoading: boolean;
}

export function useTasks(businessId: string | null | undefined): UseTasksResult {
    const [tasks, setTasks] = useState<TaskListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);


    const loadedFor = useRef<string | null>(null);

    const hasData = useRef(false);
    // Ignore responses that arrive after a newer request started.
    const requestId = useRef(0);

    const refetch = useCallback(async () => {
        if (!businessId) return;
        const rid = ++requestId.current;
        try {
            if (!hasData.current) setLoading(true);
            setError('');
            const data = await getTasks(businessId);
            if (rid !== requestId.current) return;
            setTasks(data);
            hasData.current = true;
        } catch (err: unknown) {
            if (rid !== requestId.current) return;
            setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        } finally {
            if (rid === requestId.current) setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (!businessId) return;
        if (loadedFor.current === businessId) return; // Strict Mode re-run
        loadedFor.current = businessId;
        hasData.current = false; // new business: show the skeleton again
        setTasks([]);
        refetch();
    }, [businessId, refetch]);

    // Update one row in place after a successful save (no network call)
    const patchTask = useCallback(
        (taskId: string, patch: Partial<TaskListItem>) => {
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
            );
        },
        [],
    );

    const removeTask = useCallback(
        async (taskId: string) => {
            if (!businessId) return;
            try {
                setDeleteLoading(true);
                setError('');
                await deleteTask(businessId, taskId);
                setTasks((prev) => prev.filter((t) => t.id !== taskId));
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to delete task');
                throw err; // let the caller know the delete didn't go through
            } finally {
                setDeleteLoading(false);
            }
        },
        [businessId],
    );

    return {
        tasks,
        loading,
        error,
        setError,
        refetch,
        removeTask,
        patchTask,
        deleteLoading,
    };
}