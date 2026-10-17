"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getReminders, deleteReminder } from "@/services/reminderService";
import { ReminderDetail } from "@/types/reminders.types";
import { useAsyncAction } from "@/hooks/useAnyAction";

export interface UseRemindersResult {
  reminders: ReminderDetail[];
  loading: boolean;
  error: string;
  clearError: () => void;
  refetch: () => Promise<void>;
  /** Resolves true if the delete succeeded, false if it failed. */
  removeReminder: (reminderId: string, label?: string) => Promise<boolean>;
  patchReminder: (reminderId: string, patch: Partial<ReminderDetail>) => void;
  deleteLoading: boolean;
}

export function useReminders(
  businessId: string | null | undefined,
): UseRemindersResult {
  const [reminders, setReminders] = useState<ReminderDetail[]>([]);

  const fetchAction = useAsyncAction(true);
  const deleteAction = useAsyncAction();
  const { run: runFetch, clearError: clearFetchError } = fetchAction;
  const { run: runDelete, clearError: clearDeleteError } = deleteAction;

  const loadedFor = useRef<string | null>(null);
  // Ignore responses that arrive after a newer request started.
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    if (!businessId) return;
    const rid = ++requestId.current;

    const fetchAll = async () => {
      let allItems: ReminderDetail[] = [];
      let cursor: string | null = null;
      do {
        const data = await getReminders(businessId, cursor ?? undefined);
        allItems = [...allItems, ...(data.items || [])];
        cursor = data.next_cursor;
      } while (cursor);
      return allItems;
    };

    await runFetch(fetchAll, {
      errorMessage: "Failed to fetch reminders",
      showErrorToast: false,
      onSuccess: (items) => {
        if (rid !== requestId.current) return;
        setReminders(items);
      },
    });
  }, [businessId, runFetch]);

  useEffect(() => {
    if (!businessId) return;
    if (loadedFor.current === businessId) return; // Strict Mode re-run
    loadedFor.current = businessId;
    setReminders([]); // new business: show the skeleton again
    refetch();
  }, [businessId, refetch]);

  const patchReminder = useCallback(
    (reminderId: string, patch: Partial<ReminderDetail>) => {
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? { ...r, ...patch } : r)),
      );
    },
    [],
  );

  const removeReminder = useCallback(
    async (reminderId: string, label?: string) => {
      if (!businessId) return false;
      let ok = false;
      await runDelete(() => deleteReminder(businessId, reminderId), {
        successMessage: label ? `"${label}" deleted` : "Reminder deleted",
        errorMessage: "Failed to delete reminder",
        onSuccess: () => {
          ok = true;
          setReminders((prev) => prev.filter((r) => r.id !== reminderId));
        },
      });
      return ok;
    },
    [businessId, runDelete],
  );

  const clearError = useCallback(() => {
    clearFetchError();
    clearDeleteError();
  }, [clearFetchError, clearDeleteError]);

  return {
    reminders,
    loading: fetchAction.loading,
    error: fetchAction.error || deleteAction.error,
    clearError,
    refetch,
    removeReminder,
    patchReminder,
    deleteLoading: deleteAction.loading,
  };
}