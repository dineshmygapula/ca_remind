"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMessageTemplates,
  deleteMessageTemplate,
} from "@/services/messageTemplateService";
import { MessageTemplateListItem } from "@/types/messageTemplate.types";
import { useAsyncAction } from "@/hooks/useAnyAction";

export interface UseTemplatesResult {
  templates: MessageTemplateListItem[];
  loading: boolean;
  error: string;
  clearError: () => void;
  refetch: () => Promise<void>;
  /** Resolves true if the delete succeeded, false if it failed. */
  removeTemplate: (id: string, label?: string) => Promise<boolean>;
  patchTemplate: (id: string, patch: Partial<MessageTemplateListItem>) => void;
  deleteLoading: boolean;
}

export function useTemplates(
  businessId: string | null | undefined,
): UseTemplatesResult {
  const [templates, setTemplates] = useState<MessageTemplateListItem[]>([]);

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
    await runFetch(() => getMessageTemplates(businessId), {
      errorMessage: "Failed to load message templates",
      showErrorToast: false,
      onSuccess: (data) => {
        if (rid !== requestId.current) return;
        setTemplates(data);
      },
    });
  }, [businessId, runFetch]);

  useEffect(() => {
    if (!businessId) return;
    if (loadedFor.current === businessId) return; // Strict Mode re-run
    loadedFor.current = businessId;
    setTemplates([]); // new business: show the skeleton again
    refetch();
  }, [businessId, refetch]);

  // Update one row in place (no network call)
  const patchTemplate = useCallback(
    (id: string, patch: Partial<MessageTemplateListItem>) => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  const removeTemplate = useCallback(
    async (id: string, label?: string) => {
      if (!businessId) return false;
      let ok = false;
      await runDelete(() => deleteMessageTemplate(businessId, id), {
        successMessage: label ? `"${label}" deleted` : "Template deleted",
        errorMessage: "Failed to delete template",
        onSuccess: () => {
          ok = true;
          setTemplates((prev) => prev.filter((t) => t.id !== id));
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
    templates,
    loading: fetchAction.loading,
    error: fetchAction.error || deleteAction.error,
    clearError,
    refetch,
    removeTemplate,
    patchTemplate,
    deleteLoading: deleteAction.loading,
  };
}