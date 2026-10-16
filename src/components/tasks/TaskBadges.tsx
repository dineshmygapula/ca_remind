import { CheckCircle2, Clock, XCircle, LucideIcon } from "lucide-react";

const PILL = "inline-flex items-center rounded-full text-xs font-semibold";

const TYPE_STYLES: { match: string; label: string; className: string }[] = [
  { match: "GST", label: "GST", className: "bg-[#eff6ff] text-[#2563eb] dark:bg-blue-950/40 dark:text-blue-300" },
  { match: "TDS", label: "TDS", className: "bg-[#f5f3ff] text-[#7c3aed] dark:bg-purple-950/40 dark:text-purple-300" },
  { match: "ROC", label: "ROC", className: "bg-[#ecfeff] text-[#0891b2] dark:bg-cyan-950/40 dark:text-cyan-300" },
  { match: "ITR", label: "ITR", className: "bg-[#ecfdf5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-300" },
  { match: "MSME", label: "MSME", className: "bg-[#fffbeb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-300" },
];

const NEUTRAL = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

export function TaskTypeBadge({ type }: { type?: string }) {
  if (!type) return <span className="text-xs text-slate-400">—</span>;
  const upper = type.toUpperCase();
  const style = TYPE_STYLES.find((s) => upper.includes(s.match));

  return (
    <span className={`${PILL} px-2.5 py-0.5 ${style?.className ?? NEUTRAL}`}>
      {style?.label ?? type}
    </span>
  );
}

const STATUS_STYLES: Record<
  string,
  { label: string; icon: LucideIcon; className: string; iconClassName: string }
> = {
  COMPLETED: {
    label: "COMPLETED",
    icon: CheckCircle2,
    className: "bg-[#ecfdf5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400",
    iconClassName: "fill-[#059669] text-white dark:fill-emerald-400 dark:text-slate-900",
  },
  OPEN: {
    label: "OPEN",
    icon: Clock,
    className: "bg-[#eff6ff] text-[#2563eb] dark:bg-blue-950/40 dark:text-blue-400",
    iconClassName: "text-[#2563eb] dark:text-blue-400",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    icon: Clock,
    className: "bg-[#fffbeb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400",
    iconClassName: "text-[#d97706] dark:text-amber-400",
  },
  CANCELLED: {
    label: "CANCELLED",
    icon: XCircle,
    className: "bg-[#fef2f2] text-[#ef4444] dark:bg-rose-950/40 dark:text-rose-400",
    iconClassName: "text-[#ef4444] dark:text-rose-400",
  },
  CLOSED: {
    label: "CLOSED",
    icon: CheckCircle2,
    className: NEUTRAL,
    iconClassName: "text-slate-500",
  },
};

export function TaskStatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-slate-400">—</span>;
  const key = status.toUpperCase();
  const style = STATUS_STYLES[key] ?? {
    label: key,
    icon: Clock,
    className: NEUTRAL,
    iconClassName: "text-slate-500",
  };
  const Icon = style.icon;

  return (
    <span className={`${PILL} gap-1.5 px-3 py-1 font-bold ${style.className}`}>
      <Icon className={`h-3.5 w-3.5 ${style.iconClassName}`} />
      <span>{style.label}</span>
    </span>
  );
}