'use client';

import { ReactNode } from 'react';
import { Search, RotateCcw } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FilterOption {
    label: string;
    value: string;
}

/** One dropdown in the bar — pass as many of these as a given page needs. */
export interface FilterSelectConfig {
    /** Unique key, also used as the React list key */
    key: string;
    /** Small label shown above the select, e.g. "Status" */
    label: string;
    value: string;
    options: readonly FilterOption[];
    onChange: (value: string) => void;
    /** Tailwind width class override, defaults to a sensible min-width */
    widthClass?: string;
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

    /** Any number of select-style filters (Status, Task Type, Channel, When…) */
    filters?: FilterSelectConfig[];

    /** Optional From/To date row, only rendered when provided */
    dateRange?: DateRangeConfig;

    /** Shown as an outlined button with a reset icon when provided */
    onReset?: () => void;

    /** Escape hatch for a page-specific field this component doesn't know about */
    extra?: ReactNode;

    className?: string;
}

// ─── Shared field wrapper (fieldset + legend = the "notched label" look) ─────

function FieldWrapper({
    label,
    widthClass,
    children,
}: {
    label?: string;
    widthClass?: string;
    children: ReactNode;
}) {
    return (
        <div className={`flex flex-col gap-1 ${widthClass ?? 'min-w-[160px] flex-1'}`}>
            {label && (
                <label className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
                    {label}
                </label>
            )}
            {children}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterBar({
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Search...',
    showSearch = true,
    filters = [],
    dateRange,
    onReset,
    extra,
    className = '',
}: FilterBarProps) {
    return (
        <div
            className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm ${className}`}
        >
            <div className="flex flex-wrap items-end gap-4">
                {/* Search */}
                {showSearch && (
                    <div className="min-w-[220px] flex-[2]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15 transition-colors"
                            />
                        </div>
                    </div>
                )}

                {/* Dynamic select filters */}
                {filters.map((filter) => (
                    <FieldWrapper key={filter.key} label={filter.label} widthClass={filter.widthClass}>
                        <div className="relative">
                            <select
                                value={filter.value}
                                onChange={(e) => filter.onChange(e.target.value)}
                                className="h-10 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-3 pr-8 text-sm font-medium text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15 transition-colors cursor-pointer"
                            >
                                {filter.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {/* Chevron */}
                            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </FieldWrapper>
                ))}

                {extra}

                {/* Reset */}
                {onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg)] transition-colors cursor-pointer self-end"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                )}
            </div>

            {/* Optional date range row */}
            {dateRange && (
                <div className="mt-4 flex flex-wrap gap-4">
                    <FieldWrapper label={dateRange.fromLabel ?? 'From Date'} widthClass="min-w-[180px]">
                        <input
                            type="date"
                            value={dateRange.fromValue}
                            onChange={(e) => dateRange.onFromChange(e.target.value)}
                            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                        />
                    </FieldWrapper>
                    <FieldWrapper label={dateRange.toLabel ?? 'To Date'} widthClass="min-w-[180px]">
                        <input
                            type="date"
                            value={dateRange.toValue}
                            onChange={(e) => dateRange.onToChange(e.target.value)}
                            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                        />
                    </FieldWrapper>
                </div>
            )}
        </div>
    );
}