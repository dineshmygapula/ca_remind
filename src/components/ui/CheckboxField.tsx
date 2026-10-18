
"use client";

import { useFormContext } from "react-hook-form";

export function CheckboxField({ name, label }: { name: string; label: string }) {
    const { register } = useFormContext();

    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                {...register(name)}
                className="peer sr-only"
            />

            <span
                aria-hidden="true"
                className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#a8a29e] bg-white transition-colors
                peer-checked:border-[#14224d] peer-checked:bg-[#14224d]
                peer-focus-visible:ring-2 peer-focus-visible:ring-[#c9a227] peer-focus-visible:ring-offset-2
                after:h-2 after:w-1 after:translate-y-[-1px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white after:opacity-0 after:content-['']
                peer-checked:after:opacity-100
                dark:border-slate-500 dark:bg-slate-800
                dark:peer-checked:border-[#e0b93a] dark:peer-checked:bg-[#e0b93a]
                dark:peer-checked:after:border-[#14224d]"
            />

            <span className="text-[13px] text-[var(--text-secondary)]">
                {label}
            </span>
        </label>
    );
}
