'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ALERT_CLASSES: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-600 text-white shadow-emerald-950/20',
  error: 'border-red-500/30 bg-red-600 text-white shadow-red-950/20',
  warning: 'border-amber-500/30 bg-amber-600 text-white shadow-amber-950/20',
  info: 'border-blue-500/30 bg-navy text-white shadow-navy/20',
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />,
  error: <AlertCircle className="h-4 w-4 shrink-0 text-white" />,
  warning: <AlertTriangle className="h-4 w-4 shrink-0 text-white" />,
  info: <Info className="h-4 w-4 shrink-0 text-white" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, d?: number) => showToast(msg, 'success', d), [showToast]);
  const error = useCallback((msg: string, d?: number) => showToast(msg, 'error', d), [showToast]);
  const info = useCallback((msg: string, d?: number) => showToast(msg, 'info', d), [showToast]);
  const warning = useCallback((msg: string, d?: number) => showToast(msg, 'warning', d), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast container (fixed top-right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl border backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${ALERT_CLASSES[t.type]}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {ICONS[t.type]}
              <span className="truncate">{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="rounded-lg p-1 text-white/80 hover:text-white hover:bg-white/20 transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside of ToastProvider
    return {
      showToast: (msg: string) => console.log(`[Toast]: ${msg}`),
      success: (msg: string) => console.log(`[Toast Success]: ${msg}`),
      error: (msg: string) => console.error(`[Toast Error]: ${msg}`),
      info: (msg: string) => console.info(`[Toast Info]: ${msg}`),
      warning: (msg: string) => console.warn(`[Toast Warning]: ${msg}`),
    };
  }
  return context;
}
