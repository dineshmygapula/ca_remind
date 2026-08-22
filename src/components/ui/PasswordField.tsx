import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Lock, Eye, EyeOff } from "lucide-react";

export function PasswordField({
    name,
    label,
    placeholder,
    onEnter,
}: {
    name: string;
    label: string;
    placeholder?: string;
    onEnter?: () => void;
}) {
    const [visible, setVisible] = useState(false);
    const { register, formState: { errors } } = useFormContext();
    const error = errors[name]?.message as string | undefined;

    return (
        <div className="w-full">
            <label htmlFor={name} className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1.5">
                {label}
            </label>

            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                <input
                    id={name}
                    type={visible ? "text" : "password"}
                    placeholder={placeholder}
                    onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
                    {...register(name)}
                    className={`w-full h-10 rounded-lg border bg-[var(--surface)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none pl-9 pr-10 transition-colors ${error
                            ? "border-red-400 focus:border-red-400"
                            : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)]"
                        }`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--heading)]"
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            {error && <p className="mt-1 text-[11px] leading-4 text-red-500">{error}</p>}
        </div>
    );
}