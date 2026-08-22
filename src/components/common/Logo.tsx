import { BellRing } from "lucide-react";

export function Logo() {
    return (
        <div className="flex items-center gap-2 font-black text-2xl tracking-tight text-[var(--heading)] cursor-pointer">
            <div className="p-2 rounded-xl bg-[var(--primary)] text-[var(--accent)] dark:bg-[var(--accent)] dark:text-[#0B1220] shadow-sm">
                <BellRing className="w-5 h-5" />
            </div>

            <span>
                Remind<span className="text-[var(--accent)]">CA</span>
            </span>
        </div>
    );
}