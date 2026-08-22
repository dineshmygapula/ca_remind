// components/auth/PasswordRequirements.tsx
import { useFormContext, useWatch } from "react-hook-form";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";

const RULES = [
    { key: "minLength", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { key: "hasUpper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { key: "hasLower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { key: "hasNumber", label: "One number", test: (p: string) => /[0-9]/.test(p) },
    { key: "hasSpecial", label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
] as const;

export function PasswordRequirements({ name = "password" }: { name?: string }) {
    const { control } = useFormContext();
    const password: string = useWatch({ control, name }) || "";

    return (
        <div className="mt-3.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
            <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                <p className="text-xs font-bold text-[var(--heading)]">Password Requirements</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                {RULES.map((rule) => {
                    const valid = rule.test(password);
                    return (
                        <div
                            key={rule.key}
                            className={`flex items-center gap-1.5 text-[11px] ${valid ? "text-green-700" : "text-[var(--text-secondary)]"
                                }`}
                        >
                            {valid ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                            <span>{rule.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}