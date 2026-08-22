import { useFormContext } from "react-hook-form";
import type { LucideIcon } from "lucide-react";

export function InputField({
    name,
    label,
    type = "text",
    placeholder,
    icon: Icon,
}: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    icon?: LucideIcon;
}) {
    const { register, formState: { errors } } = useFormContext();
    const error = errors[name]?.message as string | undefined;

    return (
        <div className="w-full">
            <label htmlFor={name} className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1.5">
                {label}
            </label>

            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                )}
                <input
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    {...register(name)}
                    className={`w-full h-10 rounded-lg border bg-[var(--surface)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none transition-colors ${Icon ? "pl-9" : "pl-3"
                        } pr-3 ${error
                            ? "border-red-400 focus:border-red-400"
                            : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)]"
                        }`}
                />
            </div>

            {error && <p className="mt-1 text-[11px] leading-4 text-red-500">{error}</p>}
        </div>
    );
}