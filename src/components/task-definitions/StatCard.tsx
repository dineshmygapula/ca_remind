import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint: ReactNode;
  valueClassName?: string;
  truncateHint?: boolean;
}

export default function StatCard({
  label,
  value,
  hint,
  valueClassName = "text-txt-main",
  truncateHint = false,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
      <span className="text-xs font-medium text-txt-sub">{label}</span>
      <div className={`mt-2 mb-1 text-3xl font-bold ${valueClassName}`}>{value}</div>
      <span className={`text-xs text-txt-sub ${truncateHint ? "block truncate" : ""}`}>
        {hint}
      </span>
    </div>
  );
}