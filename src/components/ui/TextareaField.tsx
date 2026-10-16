"use client";

import { useFormContext } from "react-hook-form";

interface TextareaFieldProps {
    name: string;
    label?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function TextareaField({
    name,
    label,
    placeholder,
    rows = 3,
    disabled,
    required,
    className = "",
}: TextareaFieldProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const error = errors[name]?.message as string | undefined;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={name} className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <textarea
                id={name}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full rounded-xl border bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none transition-all p-3.5 ${error
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                    : "border-[var(--border)] hover:border-[var(--accent)]/60 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                } ${disabled ? "opacity-60 cursor-not-allowed bg-[var(--bg)]" : ""} ${className}`}
                {...register(name)}
            />

            {error && <p className="mt-1 text-xs font-medium leading-4 text-red-500">{error}</p>}
        </div>
    );
}