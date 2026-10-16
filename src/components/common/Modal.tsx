'use client';

import { ReactNode } from 'react';
import { X, Loader2 } from 'lucide-react';

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    eyebrow?: string;
    title: string;
    icon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;

    /** Omit both to render your own footer inside `children` instead. */
    onCancel?: () => void;
    onSubmit?: () => void;
    cancelLabel?: string;
    submitLabel?: string;
    submitting?: boolean;
    submitVariant?: 'primary' | 'success' | 'danger';
}

const SIZE_CLASS: Record<NonNullable<ModalProps['size']>, string> = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
};

const SUBMIT_VARIANT_CLASS: Record<NonNullable<ModalProps['submitVariant']>, string> = {
    primary: 'bg-navy hover:bg-navy-hover',
    success: 'bg-emerald-600 hover:bg-emerald-700',
    danger:  'bg-red-600 hover:bg-red-700',
};

export default function Modal({
    open,
    onClose,
    eyebrow,
    title,
    icon,
    size = 'md',
    children,
    onCancel,
    onSubmit,
    cancelLabel = 'Cancel',
    submitLabel = 'Save',
    submitting = false,
    submitVariant = 'primary',
}: ModalProps) {
    if (!open) return null;

    const handleCancel = onCancel ?? onClose;
    const showFooter = Boolean(onSubmit || onCancel);

    return (
        <div className="modal modal-open z-50">
            <div
                className={`modal-box flex w-full max-h-[92vh] flex-col overflow-hidden rounded-2xl p-0 shadow-2xl border border-[var(--border)] ${SIZE_CLASS[size]}`}
            >
                {/* ── Header ──────────────────────────────────────────── */}
                <div className="relative flex items-center justify-between bg-gradient-to-r from-[var(--primary)] to-[#2a3f6f] px-6 py-5 text-white overflow-hidden">
                    {/* decorative glow */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[var(--accent)]/20 blur-2xl pointer-events-none" />

                    <div className="flex items-center gap-3 z-10">
                        {icon && (
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                                {icon}
                            </div>
                        )}
                        <div>
                            {eyebrow && (
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--accent)] mb-0.5">
                                    {eyebrow}
                                </p>
                            )}
                            <h2 className="text-base font-extrabold leading-tight tracking-tight">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                        className="z-10 rounded-xl bg-white/10 border border-white/20 p-1.5 transition-all hover:bg-white/25 hover:scale-105 disabled:opacity-40"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* ── Body ────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto bg-[var(--bg)] px-6 py-5">
                    {children}
                </div>

                {/* ── Footer ──────────────────────────────────────────── */}
                {showFooter && (
                    <div className="flex gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
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
                )}
            </div>

            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close"
                className="modal-backdrop backdrop-blur-sm bg-black/40"
                onClick={() => !submitting && onClose()}
            />
        </div>
    );
}