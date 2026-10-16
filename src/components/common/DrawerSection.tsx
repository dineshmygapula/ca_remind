'use client';

import React, { ReactNode } from 'react';

export interface DrawerSectionProps {
  /** Optional step number shown in the circle badge (e.g. 1, 2, 3) */
  step?: number | string;
  /** Section heading title */
  title: string;
  /** Whether this section has required fields */
  required?: boolean;
  /** Optional subtitle or note rendered on the right (e.g. "Pick one or more") */
  subtitle?: string;
  /** Optional custom action node on the right */
  action?: ReactNode;
  /** Section content */
  children: ReactNode;
  /** Additional custom class names */
  className?: string;
}

export default function DrawerSection({
  step,
  title,
  required = false,
  subtitle,
  action,
  children,
  className = '',
}: DrawerSectionProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm ${className}`}
    >
      {/* ── Section Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {step !== undefined && (
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
              {step}
            </span>
          )}
          <h3 className="text-sm font-bold text-txt-main flex items-center gap-1 leading-none">
            <span>{title}</span>
            {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
          </h3>
        </div>

        {(subtitle || action) && (
          <div className="flex items-center gap-2 shrink-0">
            {subtitle && (
              <span className="text-xs text-txt-sub font-medium">
                {subtitle}
              </span>
            )}
            {action}
          </div>
        )}
      </div>

      {/* ── Section Body ──────────────────────────────────────────── */}
      <div className="space-y-3.5">{children}</div>
    </div>
  );
}
