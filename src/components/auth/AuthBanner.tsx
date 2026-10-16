// components/auth/AuthBanner.tsx
import { ShieldCheck, CheckCircle2, Bell, Users, FileText, Clock } from "lucide-react";
import { Logo } from "../common/Logo";

const COPY = {
    login: {
        badge: "Compliance made simple",
        heading: <>Never miss a<br />compliance<br />deadline again.</>,
        body: "Automated reminders, delivery tracking, and client alerts — all in one place for your practice.",
        features: [
            { icon: Bell, text: "Smart deadline reminders sent automatically" },
            { icon: Users, text: "Client & staff task management in one place" },
            { icon: FileText, text: "Compliance reports generated instantly" },
            { icon: Clock, text: "Real-time delivery tracking & alerts" },
        ],
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
        features: [
            { icon: CheckCircle2, text: "14-day free trial, no credit card needed" },
            { icon: Bell, text: "Unlimited automated deadline reminders" },
            { icon: Users, text: "Manage all clients from a single dashboard" },
            { icon: Clock, text: "Set up in under 5 minutes" },
        ],
        stats: [
            { value: "14", label: "Day free\ntrial" },
            { value: "99.4%", label: "Delivery\nrate" },
            { value: "24/7", label: "Deadline\ntracking" },
        ],
    },
} as const;

export function AuthBanner({ mode }: { mode: "login" | "signup" }) {
    const copy = COPY[mode];

    return (
        <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[var(--primary)] text-white">
            {/* Decorative circles */}
            <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full border border-[var(--accent)]/20" />
            <div className="absolute top-16 -right-36 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />
            <div className="absolute -bottom-36 -left-24 w-[440px] h-[440px] rounded-full border border-[var(--accent)]/20" />

            <div className="relative z-10 w-full flex flex-col p-7 xl:p-9 gap-0">

                {/* ── TOP: Logo ── */}
                <div className="shrink-0">
                    <Logo variant="light" />
                </div>

                {/* ── MIDDLE: Badge + Heading + Body — grows to fill space ── */}
                <div className="flex-1 flex flex-col justify-center py-6">
                    <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 w-fit">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-[11px] font-semibold text-[var(--accent)]">{copy.badge}</span>
                    </div>

                    <h2 className="text-2xl xl:text-3xl font-black leading-[1.12] tracking-tight">
                        {copy.heading}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-slate-300 max-w-xs">{copy.body}</p>

                    {/* Feature list */}
                    <ul className="mt-5 flex flex-col gap-2.5">
                        {copy.features.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-2.5">
                                <div className="shrink-0 w-6 h-6 rounded-md bg-[var(--accent)]/15 flex items-center justify-center">
                                    <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                                </div>
                                <span className="text-xs text-slate-200 leading-4">{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── BOTTOM: Divider + Stats ── */}
                <div className="shrink-0">
                    <div className="border-t border-white/10 mb-5" />
                    <div className="grid grid-cols-3 gap-4">
                        {copy.stats.map((s) => (
                            <div key={s.label}>
                                <div className="text-xl font-black text-[var(--accent)]">{s.value}</div>
                                <div className="mt-0.5 text-[11px] text-slate-300 leading-4 whitespace-pre-line">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}