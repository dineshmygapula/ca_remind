"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTaskDefinitions,
  deleteTaskDefinition,
} from "@/services/taskDefinitionService";
import { TaskDefinitionListItem } from "@/types/taskDefinition.types";
import { useAsyncAction } from "@/hooks/useAnyAction";

export interface UseTaskDefinitionListResult {
  definitions: TaskDefinitionListItem[];
  loading: boolean;
  error: string;
  clearError: () => void;
  refetch: () => Promise<void>;
  /** Bumps after every successful fetch so open drawers can reload. */
  refreshKey: number;
  /** Resolves true if the delete succeeded, false if it failed. */
  removeDefinition: (id: string, label?: string) => Promise<boolean>;
  patchDefinition: (
    id: string,
    patch: Partial<TaskDefinitionListItem>,
  ) => void;
  deleteLoading: boolean;
}

export function useTaskDefinitionList(
  businessId: string | null | undefined,
): UseTaskDefinitionListResult {
  const [definitions, setDefinitions] = useState<TaskDefinitionListItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAction = useAsyncAction(true);
  const deleteAction = useAsyncAction();
  const { run: runFetch, clearError: clearFetchError } = fetchAction;
  const { run: runDelete, clearError: clearDeleteError } = deleteAction;

  // Which business we've already started loading. Refs survive Strict Mode's
  // dev-only unmount/remount, so the second effect run is skipped.
  const loadedFor = useRef<string | null>(null);
  // Ignore responses that arrive after a newer request started.
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    if (!businessId) return;
    const rid = ++requestId.current;
    await runFetch(() => getTaskDefinitions(businessId), {
      errorMessage: "Failed to load task definitions",
      showErrorToast: false,
      onSuccess: (data) => {
        if (rid !== requestId.current) return;
        setDefinitions(data);
        setRefreshKey((prev) => prev + 1);
      },
    });
  }, [businessId, runFetch]);

  useEffect(() => {
    if (!businessId) return;
    if (loadedFor.current === businessId) return; // Strict Mode re-run
    loadedFor.current = businessId;
    setDefinitions([]); // new business: show the skeleton again
    refetch();
  }, [businessId, refetch]);

  // Update one row in place (no network call)
  const patchDefinition = useCallback(
    (id: string, patch: Partial<TaskDefinitionListItem>) => {
      setDefinitions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      );
    },
    [],
  );

  const removeDefinition = useCallback(
    async (id: string, label?: string) => {
      if (!businessId) return false;
      let ok = false;
      await runDelete(() => deleteTaskDefinition(businessId, id), {
        successMessage: label ? `"${label}" deleted` : "Task definition deleted",
        errorMessage: "Failed to delete task definition",
        onSuccess: () => {
          ok = true;
          setDefinitions((prev) => prev.filter((d) => d.id !== id));
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
    definitions,
    loading: fetchAction.loading,
    error: fetchAction.error || deleteAction.error,
    clearError,
    refetch,
    refreshKey,
    removeDefinition,
    patchDefinition,
    deleteLoading: deleteAction.loading,
  };
}