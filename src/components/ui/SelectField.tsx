"use client";

import { useFormContext } from "react-hook-form";
import { LucideIcon, ChevronDown } from "lucide-react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    name: string;
    label?: string;
    options: SelectOption[];
    placeholder?: string;
    icon?: LucideIcon;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function SelectField({
    name,
    label,
    options,
    placeholder = "Select an option",
    icon: Icon,
    disabled,
    required,
    className = "",
}: SelectFieldProps) {
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

            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                )}
                <select
                    id={name}
                    disabled={disabled}
                    defaultValue=""
                    className={`w-full h-11 rounded-xl border bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] outline-none transition-all appearance-none cursor-pointer ${Icon ? "pl-10" : "pl-3.5"
                        } pr-10 ${error
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                            : "border-[var(--border)] hover:border-[var(--accent)]/60 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                        } ${disabled ? "opacity-60 cursor-not-allowed bg-[var(--bg)]" : ""} ${className}`}
                    {...register(name)}
                >
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[var(--surface)] text-[var(--text-primary)] py-1">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none opacity-70" />
            </div>

            {error && <p className="mt-1 text-xs font-medium leading-4 text-red-500">{error}</p>}
        </div>
    );
}