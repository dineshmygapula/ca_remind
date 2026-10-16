'use client';

import React, { ReactNode, useEffect } from 'react';
import { X, Loader2, Check, Plus } from 'lucide-react';

// ─── Dialog Props ─────────────────────────────────────────────────────────────

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;

  /** Eyebrow text above title (e.g. "New reminder", "Edit reminder") */
  eyebrow?: string;
  /** Main dialog title */
  title: string;

  /** Left header icon in the amber badge (defaults to Plus icon) */
  icon?: ReactNode;

  /** Optional badge next to title */
  badge?: ReactNode;

  /** Max width of dialog. Default is 'xl' (~768px) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /** Middle scrollable body content */
  children: ReactNode;

  // ── Footer Buttons ──────────────────────────────────────────────────────────
  /** Show or customize cancel action */
  onCancel?: () => void;
  cancelLabel?: string;

  /** Show or customize submit action */
  onSubmit?: () => void | Promise<void>;
  submitLabel?: string;
  submitIcon?: ReactNode;
  submitVariant?: 'gold' | 'primary' | 'danger';
  submitting?: boolean;
  submitDisabled?: boolean;

  /** Fully custom footer element. If provided, replaces default cancel/submit buttons */
  customFooter?: ReactNode;
}

const MAX_WIDTH_CLASS: Record<NonNullable<FormDialogProps['maxWidth']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
};

const SUBMIT_VARIANT_CLASS: Record<
  NonNullable<FormDialogProps['submitVariant']>,
  string
> = {
  gold: 'bg-[#e5a824] hover:bg-[#d49717] text-slate-950 shadow-amber-500/15',
  primary: 'bg-navy hover:bg-navy-hover text-white shadow-blue-950/20',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/20',
};

export default function FormDialog({
  open,
  onClose,
  eyebrow,
  title,
  icon,
  badge,
  maxWidth = 'xl',
  children,
  onCancel,
  onSubmit,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  submitIcon = <Check className="w-4 h-4 stroke-[2.5]" />,
  submitVariant = 'gold',
  submitting = false,
  submitDisabled = false,
  customFooter,
}: FormDialogProps) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const handleCancel = onCancel ?? onClose;
  const showFooter = customFooter !== undefined || onSubmit !== undefined || onCancel !== undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-xs transition-opacity duration-200"
    >
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0"
        aria-hidden="true"
        onClick={() => {
          if (!submitting) onClose();
        }}
      />

      {/* Main Dialog Box */}
      <div
        className={`relative z-10 flex flex-col w-full max-h-[92vh] rounded-3xl bg-[var(--surface)] shadow-2xl overflow-hidden border border-[var(--border)] animate-in fade-in zoom-in-95 duration-200 ${MAX_WIDTH_CLASS[maxWidth]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Navy Header Banner ──────────────────────────────────────────────── */}
        <div className="relative shrink-0 bg-[#0F1E36] px-6 py-4.5 sm:px-7 sm:py-5 flex items-center justify-between text-white border-b border-white/10 select-none">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Amber square icon badge */}
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-slate-950 font-bold shadow-sm shrink-0">
              {icon ?? <Plus className="w-5 h-5 stroke-[2.5]" />}
            </div>

            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[11px] font-bold tracking-wider uppercase text-[#F59E0B] mb-0.5">
                  {eyebrow}
                </p>
              )}
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white truncate">
                  {title}
                </h2>
                {badge}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            className="rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 p-2 text-white/80 hover:text-white transition-all disabled:opacity-40 shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Middle Body (children) ───────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg)] p-4 sm:p-6 space-y-4">
          {children}
        </div>

        {/* ── Sticky Bottom Footer ────────────────────────────────────────────── */}
        {showFooter && (
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 bg-[var(--surface)] border-t border-[var(--border)]">
            {customFooter ? (
              customFooter
            ) : (
              <>
                {onCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-txt-main bg-[var(--surface)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {cancelLabel}
                  </button>
                )}

                {onSubmit && (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting || submitDisabled}
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none ${SUBMIT_VARIANT_CLASS[submitVariant]}`}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-inherit" />
                    ) : (
                      submitIcon
                    )}
                    <span>{submitting ? 'Please wait...' : submitLabel}</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper: Dialog Section Card ──────────────────────────────────────────────

export interface DialogSectionProps {
  step?: number | string;
  title: string;
  required?: boolean;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DialogSection({
  step,
  title,
  required = false,
  subtitle,
  action,
  children,
  className = '',
}: DialogSectionProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs transition-shadow hover:shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {step !== undefined && (
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
              {step}
            </div>
          )}
          <h3 className="text-sm font-bold text-txt-main flex items-center gap-1 leading-none">
            <span>{title}</span>
            {required && <span className="text-red-500 font-bold">*</span>}
          </h3>
        </div>

        {(subtitle || action) && (
          <div className="flex items-center gap-2 shrink-0">
            {subtitle && (
              <span className="text-xs text-txt-sub font-medium">
                {subtitle}
              </span>
            )}
            {action}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
