import { useFormContext } from "react-hook-form";

export function CheckboxField({ name, label }: { name: string; label: string }) {
    const { register } = useFormContext();
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                {...register(name)}
                className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
        </label>
    );
}