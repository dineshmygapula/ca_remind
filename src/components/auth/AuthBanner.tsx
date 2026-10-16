import { Bell, Users, FileText, Clock, ShieldCheck } from "lucide-react";
import { Logo } from "../common/Logo";

const COPY = {
    login: {
        headline: "Never miss a compliance deadline again.",
        sub: "Automated reminders, delivery tracking and client alerts, all in one place for your practice.",
    },
    signup: {
        headline: "Set up your practice in minutes.",
        sub: "Add your clients, choose your rules, and let RemindCA handle the deadlines.",
    },
} as const;

const FEATURES = [
    { icon: Bell, text: "Smart deadline reminders, sent automatically" },
    { icon: Users, text: "Client and staff tasks in one place" },
    { icon: FileText, text: "Compliance reports generated instantly" },
    { icon: Clock, text: "Real-time delivery tracking and alerts" },
];

const STATS = [
    { value: "132", label: "Delivered this month" },
    { value: "99.4%", label: "Delivery rate" },
    { value: "48", label: "Active reminders" },
];

export function AuthBanner({ mode }: { mode: "login" | "signup" }) {
    const copy = COPY[mode];

    return (
        <aside className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] shrink-0 flex-col gap-10 overflow-hidden bg-[#14224D] px-14 py-14 text-white">
            {/* decorative rings */}
          

          <Logo authBanner={true}/>

            {/* headline */}
            <div className="relative flex max-w-[520px] flex-col gap-6">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#F2B63F]/45 px-3.5 py-1.5 text-[13.5px] font-bold text-[#F2B63F]">
                    <ShieldCheck className="h-4 w-4" />
                    Compliance made simple
                </span>
                <h1 className="text-[52px] font-extrabold leading-[1.05] tracking-[-0.035em]">
                    {copy.headline}
                </h1>
                <p className="text-lg leading-relaxed text-white/80">{copy.sub}</p>
            </div>

            {/* features */}
            <ul className="relative grid max-w-[620px] grid-cols-1 gap-3 xl:grid-cols-2">
                {FEATURES.map(({ icon: Icon, text }) => (
                    <li
                        key={text}
                        className="flex items-center gap-3.5 rounded-2xl bg-white/[0.07] px-4 py-3.5"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F2B63F]/15 text-[#F2B63F]">
                            <Icon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <span className="text-[14.5px] font-semibold">{text}</span>
                    </li>
                ))}
            </ul>

            {/* stats */}
            <dl className="relative mt-auto flex flex-wrap gap-x-14 gap-y-6 border-t border-white/15 pt-7">
                {STATS.map((s) => (
                    <div key={s.label} className="flex flex-col gap-0.5">
                        <dd className="order-1 text-[32px] font-extrabold leading-none tracking-tight text-[#F2B63F]">
                            {s.value}
                        </dd>
                        <dt className="order-2 mt-1 text-sm text-white/75">{s.label}</dt>
                    </div>
                ))}
            </dl>
        </aside>
    );
}