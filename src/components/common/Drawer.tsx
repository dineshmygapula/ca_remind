'use client';

import { ReactNode, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DrawerProps {
  open: boolean;
  onClose: () => void;

  /** Small label above the title (e.g. "New Task") */
  eyebrow?: string;
  title: string;

  /** Badge displayed beside title (e.g. status) */
  badge?: ReactNode;

  /** Icon rendered in the coloured icon badge in the header */
  icon?: ReactNode;

  /** Extra action buttons rendered in header beside close button (e.g. edit button) */
  headerActions?: ReactNode;

  /** Width of the drawer panel. Defaults to 'md'. */
  width?: 'sm' | 'md' | 'lg' | 'xl';

  children: ReactNode;

  /** Custom header node. If provided, replaces default top banner header. */
  customHeader?: ReactNode;

  /** Custom footer node. If provided, replaces default onCancel/onSubmit footer buttons. */
  footer?: ReactNode;

  // ── Footer (omit both to skip footer entirely) ──────────────────────────────
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  submitting?: boolean;
  submitVariant?: 'primary' | 'success' | 'danger' | 'gold';
}

// ─── Width map ────────────────────────────────────────────────────────────────

const WIDTH_CLASS: Record<NonNullable<DrawerProps['width']>, string> = {
  sm: 'max-w-sm',   // ~384 px
  md: 'max-w-lg',   // ~512 px
  lg: 'max-w-2xl',  // ~672 px
  xl: 'max-w-3xl',  // ~768 px
};

// ─── Submit-variant colours ───────────────────────────────────────────────────

const SUBMIT_VARIANT_CLASS: Record<NonNullable<DrawerProps['submitVariant']>, string> = {
  primary: 'bg-navy hover:bg-navy-hover',
  gold: 'bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold',
  success: 'bg-emerald-600 hover:bg-emerald-700',
  danger: 'bg-red-600 hover:bg-red-700',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Drawer({
  open,
  onClose,
  eyebrow,
  title,
  badge,
  icon,
  headerActions,
  width = 'md',
  children,
  customHeader,
  footer,
  onCancel,
  onSubmit,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  submitting = false,
  submitVariant = 'primary',
}: DrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleCancel = onCancel ?? onClose;
  const showFooter = Boolean(footer || onSubmit || onCancel);

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => !submitting && onClose()}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 m-0 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col
          border-l border-[var(--border)] bg-[var(--bg)] shadow-2xl
          transition-transform duration-300 ease-in-out
          ${WIDTH_CLASS[width]}
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        {customHeader ? (
          <div className="shrink-0">{customHeader}</div>
        ) : (
          <div className="relative flex items-center justify-between bg-gradient-to-r from-[var(--primary)] to-[#2a3f6f] px-6 py-5 text-white overflow-hidden shrink-0">
            {/* decorative glow */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[var(--accent)]/20 blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 z-10 min-w-0">
              {icon && (
                <div className="flex shrink-0 items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {eyebrow && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--accent)] mb-0.5">
                    {eyebrow}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold leading-tight tracking-tight truncate">
                    {title}
                  </h2>
                  {badge}
                </div>
              </div>
            </div>

            <div className="z-10 ml-4 flex items-center gap-1.5 shrink-0">
              {headerActions}
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close drawer"
                className="rounded-xl bg-white/10 border border-white/20 p-1.5 transition-all hover:bg-white/25 hover:scale-105 disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        {footer ? (
          <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
            {footer}
          </div>
        ) : showFooter ? (
          <div className="shrink-0 flex gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-semibold text-txt-main bg-[var(--bg)] transition-all hover:bg-[var(--border)]/60 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            {onSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className={`flex flex-[2] items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:translate-y-0 ${SUBMIT_VARIANT_CLASS[submitVariant]}`}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitLabel}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
