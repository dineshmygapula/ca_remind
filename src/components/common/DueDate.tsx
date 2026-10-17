// components/ui/DueDate.tsx
import { Calendar } from "lucide-react";
const BADGE = "inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold";
const TONES = {
  overdue: "bg-[#fef2f2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400",
  soon: "bg-[#fffbeb] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400",
  later:
    "bg-[#eef2ff] text-[#4f46e5] dark:bg-indigo-950/40 dark:text-indigo-400",
};

function getBadge(diff: number) {
  if (diff < 0)
    return { tone: TONES.overdue, label: `${Math.abs(diff)}d overdue` };
  if (diff === 0) return { tone: TONES.soon, label: "Due today" };
  if (diff <= 7) return { tone: TONES.soon, label: `Due in ${diff} days` };
  return { tone: TONES.later, label: `In ${diff} days` };
}

type Props = {
  value?: string | null;
  completed?: boolean; // hides the badge
  showBadge?: boolean;
};

export function DueDate({ value, completed = false, showBadge = true }: Props) {
  if (!value) return <span className="text-xs text-slate-400">—</span>;

  const diff = getTaskDueDiffDays(value);
  const badge =
    diff !== null && showBadge && !completed ? getBadge(diff) : null;

  return (
    <div className="flex flex-col justify-center py-1 leading-tight">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
          {formatTaskDueDate(value) || value}
        </span>
      </div>
      {badge && (
        <div className="mt-0.5">
          <span className={`${BADGE} ${badge.tone}`}>{badge.label}</span>
        </div>
      )}
    </div>
  );
}
