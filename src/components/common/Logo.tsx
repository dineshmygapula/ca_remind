import { BellRing } from "lucide-react";

interface LogoProps {
    /** "default" uses CSS vars (header/app shell). "light" forces white text for dark backgrounds (auth banner). */
    variant?: "default" | "light";
}

export function Logo({ variant = "default" }: LogoProps) {
    const isLight = variant === "light";

    return (
        <div
            className={`flex items-center gap-2 font-black text-2xl tracking-tight cursor-pointer ${
                isLight ? "text-white" : "text-[var(--heading)]"
            }`}
        >
            <div
                className={`p-2 rounded-xl shadow-sm flex items-center justify-center ${
                    isLight
                        ? "bg-[var(--accent)] text-[var(--primary)]"
                        : "bg-[var(--primary)] text-[var(--accent)] dark:bg-[var(--accent)] dark:text-[#0B1220]"
                }`}
            >
                <BellRing className="w-5 h-5" />
            </div>

            <span>
                Remind
                <span className={isLight ? "text-[var(--accent)]" : "text-[var(--accent)]"}>
                    CA
                </span>
            </span>
        </div>
    );
}