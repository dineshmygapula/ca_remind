'use client';

import React, { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
  /** Whether the section is collapsible */
  collapsible?: boolean;
  /** Controlled expanded state (if collapsible) */
  expanded?: boolean;
  /** Default expanded state when uncontrolled (defaults to true) */
  defaultExpanded?: boolean;
  /** Toggle callback */
  onToggle?: () => void;
}

export default function DrawerSection({
  step,
  title,
  required = false,
  subtitle,
  action,
  children,
  className = '',
  collapsible = false,
  expanded: controlledExpanded,
  defaultExpanded = true,
  onToggle,
}: DrawerSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = collapsible
    ? controlledExpanded !== undefined
      ? controlledExpanded
      : internalExpanded
    : true;

  const handleToggle = () => {
    if (!collapsible) return;
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm ${className}`}
    >
      {/* ── Section Header ────────────────────────────────────────── */}
      <div
        className={`flex items-center justify-between gap-3 ${
          isExpanded ? 'mb-4' : ''
        } ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? handleToggle : undefined}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={
          collapsible
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle();
                }
              }
            : undefined
        }
      >
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

        <div className="flex items-center gap-2 shrink-0">
          {subtitle && (
            <span className="text-xs text-txt-sub font-medium">
              {subtitle}
            </span>
          )}
          {action && (
            <div onClick={(e) => e.stopPropagation()}>
              {action}
            </div>
          )}
          {collapsible && (
            <div className="p-1 rounded-lg text-txt-sub hover:text-txt-main transition-colors">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Section Body ──────────────────────────────────────────── */}
      {isExpanded && <div className="space-y-3.5">{children}</div>}
    </div>
  );
}

