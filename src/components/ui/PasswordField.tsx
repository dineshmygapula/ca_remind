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
            <label htmlFor={name} className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">
                {label}
            </label>

            <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                <input
                    id={name}
                    type={visible ? "text" : "password"}
                    placeholder={placeholder}
                    onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
                    {...register(name)}
                    className={`w-full h-11 rounded-xl border bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 outline-none pl-10 pr-10 transition-all ${error
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
                            : "border-[var(--border)] hover:border-[var(--primary)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
                        }`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--heading)] cursor-pointer"
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            {error && <p className="mt-1 text-[11px] leading-4 text-red-500">{error}</p>}
        </div>
    );
}