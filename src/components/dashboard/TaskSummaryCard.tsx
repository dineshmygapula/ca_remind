'use client';

import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface TaskSummaryCardProps {
  icon: ReactNode;
  count: number;
  label: string;
  sublabel?: string;
  iconBgColor: string;
  onClick?: () => void;
}

export default function TaskSummaryCard({
  icon,
  count,
  label,
  sublabel,
  iconBgColor,
  onClick,
}: TaskSummaryCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative flex flex-col gap-5 overflow-hidden rounded-2xl border p-6
        bg-[var(--surface)] border-[var(--border)]
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5 hover:border-[var(--accent)]/50' : ''}
      `}
    >
      {/* Top accent line, appears on hover */}
      {onClick && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--accent)] scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100" />
      )}

      {/* Icon + hover arrow */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBgColor }}
        >
          {icon}
        </div>
        {onClick && (
          <ChevronRight
            className="h-4 w-4 text-[var(--text-secondary)] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
          />
        )}
      </div>

      {/* Count + label */}
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-bold leading-none tracking-tight text-[var(--text-primary)]">
          {count}
        </p>
        {sublabel && (
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            {sublabel}
          </p>
        )}
      </div>

      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>
    </div>
  );
}