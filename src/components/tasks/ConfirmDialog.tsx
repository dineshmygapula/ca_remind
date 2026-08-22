'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    variant?: 'danger' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
}

const VARIANT_CLASS: Record<NonNullable<ConfirmDialogProps['variant']>, string> = {
    danger: 'btn-error',
    primary: 'btn-primary',
};

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    loading = false,
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-xs overflow-hidden rounded-2xl bg-surface p-0">
                <div className="border-b border-divider px-6 pb-4 pt-5">
                    <h3 className="text-base font-bold text-txt-main">{title}</h3>
                </div>

                <div className="px-6 pt-5 text-sm text-txt-sub">{description}</div>

                <div className="flex gap-2 px-6 py-4">
                    <button
                        type="button"
                        className="btn btn-outline flex-1 border-divider text-txt-main hover:bg-transparent"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={`btn flex-1 text-white ${VARIANT_CLASS[variant]}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
                    </button>
                </div>
            </div>

            <button
                type="button"
                aria-label="Close"
                className="modal-backdrop"
                onClick={() => !loading && onCancel()}
            />
        </div>
    );
}