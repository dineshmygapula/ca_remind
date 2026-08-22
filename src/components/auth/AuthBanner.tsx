// components/auth/AuthBanner.tsx
import { Bell, ShieldCheck } from "lucide-react";

const COPY = {
    login: {
        badge: "Compliance made simple",
        heading: <>Never miss a<br />compliance<br />deadline<br />again.</>,
        body: "Automated reminders, delivery tracking, and client alerts — all in one place for your practice.",
        stats: [
            { value: "132", label: "Delivered\nthis month" },
            { value: "99.4%", label: "Delivery\nrate" },
            { value: "48", label: "Active\nreminders" },
        ],
    },
    signup: {
        badge: "Start your free trial",
        heading: <>Take control of<br />your compliance<br />workflow.</>,
        body: "Automate reminders, track deadlines, and keep every client obligation organized in one place.",
        stats: [
            { value: "14", label: "Day free\ntrial" },
            { value: "99.4%", label: "Delivery\nrate" },
            { value: "24/7", label: "Deadline\ntracking" },
        ],
    },
} as const;

const STATS = [
    { value: "132", label: "Delivered\nthis month" },
    { value: "99.4%", label: "Delivery\nrate" },
    { value: "48", label: "Active\nreminders" },
] as const;

export function AuthBanner({ mode }: { mode: "login" | "signup" }) {
    const copy = COPY[mode];

    return (
        <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[var(--primary)] text-white">
            <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full border border-[var(--accent)]/20" />
            <div className="absolute top-16 -right-36 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />
            <div className="absolute -bottom-36 -left-24 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />

            <div className="relative z-10 w-full flex flex-col justify-between p-7 xl:p-9">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shadow-lg">
                        <Bell className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <div className="text-lg font-black tracking-tight">
                        Remind
                        <span className="text-[var(--accent)]">CA</span>
                    </div>
                </div>

                <div className="max-w-xl">
                    <div className="inline-flex items-center gap-1.5 mb-3.5 px-2.5 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-[11px] font-semibold text-[var(--accent)]">{copy.badge}</span>
                    </div>

                    <h2 className="text-2xl xl:text-3xl font-black leading-[1.12] tracking-tight">
                        {copy.heading}
                    </h2>

                    <p className="mt-3.5 max-w-md text-sm leading-6 text-slate-300">{copy.body}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-xl">
                    {STATS.map((s) => (
                        <div key={s.label}>
                            <div className="text-lg xl:text-xl font-black text-[var(--accent)]">{s.value}</div>
                            <div className="mt-0.5 text-[11px] text-slate-300 leading-4 whitespace-pre-line">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}