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
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

const SUBMIT_VARIANT_CLASS: Record<NonNullable<ModalProps['submitVariant']>, string> = {
    primary: 'bg-navy hover:bg-navy-hover',
    success: 'bg-emerald-600 hover:bg-emerald-700',
    danger: 'bg-red-600 hover:bg-red-700',
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
        <div className="modal modal-open">
            <div
                className={`modal-box flex w-full max-h-[90vh] flex-col overflow-hidden rounded-2xl p-0 ${SIZE_CLASS[size]}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-br from-navy to-blue-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        {icon}
                        <div>
                            {eyebrow && (
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/65">
                                    {eyebrow}
                                </p>
                            )}
                            <h2 className="text-lg font-bold leading-tight">{title}</h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                        className="rounded-full bg-white/15 p-1.5 transition-colors hover:bg-white/25 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto bg-bg px-6 py-5">{children}</div>

                {/* Footer */}
                {showFooter && (
                    <div className="flex gap-2 border-t border-divider bg-surface px-6 py-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="flex-1 rounded-lg border border-divider py-2.5 text-sm font-semibold text-txt-main transition-colors hover:bg-bg disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        {onSubmit && (
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={submitting}
                                className={`flex flex-[2] items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60 ${SUBMIT_VARIANT_CLASS[submitVariant]}`}
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitLabel}
                            </button>
                        )}
                    </div>
                )}
            </div>
            <button
                type="button"
                aria-label="Close"
                className="modal-backdrop"
                onClick={() => !submitting && onClose()}
            />
        </div>
    );
}