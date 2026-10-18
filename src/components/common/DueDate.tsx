// components/common/DueDate.tsx
import { formatDueDate, getDueDiffDays } from "@/utils/formatDate";
import { Calendar } from "lucide-react";

const BADGE = "inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold";
const TONES = {
  overdue: "bg-[#fef2f2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400",
  soon: "bg-[#fffbeb] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400",
  later:
    "bg-[#eef2ff] text-[#4f46e5] dark:bg-indigo-950/40 dark:text-indigo-400",
};

function getBadge(diff: number, badgeMode: "due" | "scheduled" = "due") {
  if (diff < 0) {
    return { tone: TONES.overdue, label: `${Math.abs(diff)}d overdue` };
  }
  if (diff === 0) {
    return {
      tone: TONES.soon,
      label: badgeMode === "scheduled" ? "Scheduled today" : "Due today",
    };
  }
  if (diff === 1) {
    return {
      tone: TONES.later,
      label: "Tomorrow",
    };
  }
  if (diff <= 7) {
    return {
      tone: TONES.soon,
      label: badgeMode === "scheduled" ? `In ${diff} days` : `Due in ${diff} days`,
    };
  }
  return { tone: TONES.later, label: `In ${diff} days` };
}

function extractTime(dateStr?: string | null): string | null {
  if (!dateStr || !dateStr.includes("T")) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

type Props = {
  value?: string | null;
  completed?: boolean;
  showBadge?: boolean;
  showTime?: boolean;
  badgeMode?: "due" | "scheduled";
};

export function DueDate({
  value,
  completed = false,
  showBadge = true,
  showTime = false,
  badgeMode = "due",
}: Props) {
  if (!value) return <span className="text-xs text-slate-400">—</span>;

  const diff = getDueDiffDays(value);
  const badge =
    diff !== null && showBadge && !completed ? getBadge(diff, badgeMode) : null;
  const time = showTime ? extractTime(value) : null;

  return (
    <div className="flex flex-col justify-center py-1 leading-tight">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
          {formatDueDate(value) || value}
        </span>
        {time && <span className="text-[11px] text-slate-400">{time}</span>}
      </div>
      {badge && (
        <div className="mt-0.5">
          <span className={`${BADGE} ${badge.tone}`}>{badge.label}</span>
        </div>
      )}
    </div>
  );
}
