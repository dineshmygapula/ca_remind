"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface RunOptions<T> {
  successMessage?: string | ((result: T) => string);
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (result: T) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export function useAsyncAction(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const clearError = useCallback(() => setError(""), []);
  const clearSuccess = useCallback(() => setSuccess(""), []);
  const reset = useCallback(() => {
    setError("");
    setSuccess("");
    setLoading(false);
  }, []);

  const run = useCallback(
    async function run<T>(
      action: () => Promise<T>,
      options: RunOptions<T> = {}
    ): Promise<T | undefined> {
      const {
        successMessage,
        errorMessage,
        showSuccessToast = true,
        showErrorToast = true,
        onSuccess,
        onError,
      } = options;

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const result = await action();

        if (successMessage) {
          const message =
            typeof successMessage === "function"
              ? successMessage(result)
              : successMessage;
          if (mountedRef.current) setSuccess(message);
          if (showSuccessToast) toast.success(message);
        }

        await onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        const normalized =
          err instanceof Error ? err : new Error(errorMessage || "Something went wrong");
        const message = errorMessage || normalized.message;
        if (mountedRef.current) setError(message);
        if (showErrorToast) toast.error(message);
        onError?.(normalized);
        return undefined;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    success,
    run,
    setError,
    clearError,
    clearSuccess,
    reset,
  };
}