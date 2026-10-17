import { useFormContext } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label?: string;
    type?: string;
    placeholder?: string;
    icon?: LucideIcon;
}

export function InputField({
    name,
    label,
    type = "text",
    placeholder,
    icon: Icon,
    disabled,
    required,
    className = "",
    onChange,
    ...props
}: InputFieldProps) {
    const { register, formState: { errors } } = useFormContext();
    const error = errors[name]?.message as string | undefined;
    const { onChange: formOnChange, ...restRegister } = register(name);

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
                <input
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...restRegister}
                    {...props}
                    onChange={(e) => {
                        formOnChange(e);
                        onChange?.(e);
                    }}
                    className={`w-full h-11 rounded-xl border bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none transition-all ${Icon ? "pl-10" : "pl-3.5"
                        } pr-3.5 ${error
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                            : "border-[var(--border)] hover:border-[var(--accent)]/60 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                        } ${disabled ? "opacity-60 cursor-not-allowed bg-[var(--bg)]" : ""} ${className}`}
                />
            </div>

            {error && <p className="mt-1 text-xs font-medium leading-4 text-red-500">{error}</p>}
        </div>
    );
}