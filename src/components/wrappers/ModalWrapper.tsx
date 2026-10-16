// components/ui/ModalWrapper.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalWrapperProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    /**
     * Fully custom header content. When provided, this replaces the default
     * title + close-button row entirely — build your own layout (avatar,
     * gradient background, close button, etc.) and pass it in here.
     */
    header?: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
    fullWidth?: boolean;
    /**
     * Fixed modal width as a percentage of the viewport width (e.g. 80 -> 80vw).
     * This overrides `maxWidth` entirely via inline style (higher specificity
     * than the Tailwind max-w-* class), since max-w-* utilities cap out at a
     * fixed rem value and don't scale with the viewport the way vw does.
     */
    widthVw?: number | null;
    /**
     * Fixed modal height as a percentage of the viewport height (e.g. 70 -> 70vh).
     * The header and actions stay put; only the content area scrolls internally.
     * Pass `null` to size the modal to its content instead (no fixed height).
     */
    heightVh?: number | null;
}

// Maps roughly to MUI's maxWidth prop using DaisyUI/Tailwind width utilities
const maxWidthClasses: Record<NonNullable<ModalWrapperProps["maxWidth"]>, string> = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-[95vw]",
};

export function ModalWrapper({
    open,
    onClose,
    title,
    header,
    children,
    actions,
    maxWidth = "sm",
    fullWidth = true,
    widthVw = null,
    heightVh = null,
}: ModalWrapperProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Sync the `open` prop with the native <dialog> element's show/close state
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Fire onClose when the dialog is closed via ESC key or backdrop click
    const handleNativeClose = () => {
        onClose();
    };

    // Close when clicking the backdrop (::backdrop area, i.e. outside the box)
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={handleNativeClose}
            onClick={handleBackdropClick}
            className="modal"
        >
            <div
                className={`modal-box p-0 overflow-hidden flex flex-col ${fullWidth ? "w-full" : ""} ${maxWidthClasses[maxWidth]}`}
                style={{
                    ...(widthVw ? { width: `${widthVw}vw`, maxWidth: `${widthVw}vw` } : {}),
                    ...(heightVh ? { height: `${heightVh}vh` } : {}),
                }}
            >
                {/* Header: custom `header` node takes over completely; otherwise fall back to the default title + close row */}
                {header ? (
                    header
                ) : (
                    title && (
                        <div className="flex justify-between items-center border-b border-base-300 px-6 py-4 shrink-0">
                            <h3 className="font-semibold text-lg">{title}</h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )
                )}

                {/* Content — the only part that scrolls when heightVh is set */}
                <div className="p-6 overflow-y-auto flex-1">{children}</div>

                {/* Optional Actions (Save/Cancel buttons) */}
                {actions && (
                    <div className="modal-action px-6 pb-6 mt-0 shrink-0">{actions}</div>
                )}
            </div>

            {/* Click outside to close (native dialog backdrop) */}
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}