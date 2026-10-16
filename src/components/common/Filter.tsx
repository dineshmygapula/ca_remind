'use client';

import { ReactNode } from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterTabsConfig {
  options: readonly FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

/** One dropdown in the filter bar */
export interface FilterSelectConfig {
  /** Unique key, also used as the React list key */
  key: string;
  /** Small label shown in prefix, e.g. "Status" -> "Status: all" */
  label?: string;
  value: string;
  options: readonly FilterOption[];
  onChange: (value: string) => void;
  /** Tailwind width override class */
  widthClass?: string;
  /** Prepend label to options (e.g. "Status: Active"). Defaults to true. */
  prefixLabel?: boolean;
}

export interface DateRangeConfig {
  fromLabel?: string;
  toLabel?: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Hide the search box entirely for pages that don't need it */
  showSearch?: boolean;

  /** Segmented pill tabs (e.g. All | Monthly | Quarterly | Yearly) */
  tabs?: FilterTabsConfig;

  /** Any number of select-style filters (Status, Task Type, Channel, When…) */
  filters?: FilterSelectConfig[];

  /** Optional From/To date range, rendered inline */
  dateRange?: DateRangeConfig;

  /** Shown as an outlined button with a reset icon when provided */
  onReset?: () => void;

  /** Escape hatch for a page-specific field or buttons */
  extra?: ReactNode;

  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOptionLabel(optLabel?: string): string {
  if (!optLabel) return '';

  let label = optLabel.trim();

  // Strip any existing colon prefix like "Status: Scheduled" or "Status: all"
  if (label.includes(':')) {
    label = label.split(':').slice(1).join(':').trim();
  }

  const lower = label.toLowerCase();

  // Simplify "All <Statuses/Channels/etc.>" and "all" / "any" to "All" (preserve "All Time")
  if (
    lower === 'all' ||
    lower === 'any' ||
    (/^all\s+/i.test(label) && lower !== 'all time')
  ) {
    return 'All';
  }

  // Capitalize first letter if it starts with a lowercase letter (e.g. "active" -> "Active", "inactive" -> "Inactive")
  if (/^[a-z]/.test(label)) {
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  return label;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = true,
  tabs,
  filters = [],
  dateRange,
  onReset,
  extra,
  className = '',
}: FilterBarProps) {
  return (
    <div
      className={`rounded-2xl border border-divider bg-surface p-3.5 sm:p-4 shadow-xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {showSearch && (
          <div className="min-w-[240px] flex-1 relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-sub/60" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-xl border border-divider bg-bg/60 pl-9 pr-3 text-sm text-txt-main placeholder:text-txt-sub/60 focus:border-blue-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>
        )}

        {/* Segmented Tabs (e.g. Schedule Tabs) */}
        {tabs && tabs.options.length > 0 && (
          <div className="bg-bg p-1 rounded-xl border border-divider/50 flex items-center gap-0.5 shrink-0">
            {tabs.options.map((tab) => {
              const isSelected =
                tab.value === ''
                  ? !tabs.value || tabs.value === 'ALL'
                  : tabs.value.toLowerCase() === tab.value.toLowerCase();

              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => tabs.onChange(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-navy text-white shadow-xs font-semibold'
                      : 'text-txt-sub hover:text-txt-main'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Select Filters */}
        {filters.map((filter) => (
          <div
            key={filter.key}
            className={`relative shrink-0 ${filter.widthClass ?? ''}`}
          >
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              title={filter.label}
              className="h-10 w-full appearance-none rounded-xl border border-divider bg-bg/60 pl-3.5 pr-8 text-sm font-medium text-txt-main focus:border-blue-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
            >
              {filter.options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-surface text-txt-main text-sm"
                >
                  {formatOptionLabel(opt.label)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
          </div>
        ))}

        {/* Date Range Inputs */}
        {dateRange && (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="date"
              value={dateRange.fromValue}
              onChange={(e) => dateRange.onFromChange(e.target.value)}
              className="h-10 rounded-xl border border-divider bg-bg/60 px-3 text-sm font-medium text-txt-main focus:border-blue-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
              title={dateRange.fromLabel ?? 'From Date'}
            />
            <span className="text-sm text-txt-sub font-medium">to</span>
            <input
              type="date"
              value={dateRange.toValue}
              onChange={(e) => dateRange.onToChange(e.target.value)}
              className="h-10 rounded-xl border border-divider bg-bg/60 px-3 text-sm font-medium text-txt-main focus:border-blue-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
              title={dateRange.toLabel ?? 'To Date'}
            />
          </div>
        )}

        {extra}

        {/* Reset */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-divider bg-surface text-sm font-medium text-txt-main hover:bg-bg transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="h-4 w-4 text-txt-sub" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}