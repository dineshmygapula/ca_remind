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
        <fieldset className={`fieldset py-0 ${widthClass ?? 'min-w-[160px] flex-1'}`}>
            {label && (
                <legend className="fieldset-legend px-1 text-xs font-medium text-navy">
                    {label}
                </legend>
            )}
            {children}
        </fieldset>
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
            className={`rounded-xl border border-divider bg-surface p-4 shadow-sm ${className}`}
        >
            <div className="flex flex-wrap items-end gap-4">
                {/* Search */}
                {showSearch && (
                    <div className="min-w-[220px] flex-[2]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-sub" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="input input-bordered input-sm w-full border-divider bg-surface pl-9 text-sm text-txt-main focus:border-navy focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* Dynamic select filters */}
                {filters.map((filter) => (
                    <FieldWrapper key={filter.key} label={filter.label} widthClass={filter.widthClass}>
                        <select
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="select select-bordered select-sm w-full border-divider bg-surface text-sm text-txt-main focus:border-navy focus:outline-none"
                        >
                            {filter.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </FieldWrapper>
                ))}

                {extra}

                {/* Reset */}
                {onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="btn btn-sm btn-outline gap-2 border-divider text-txt-main hover:border-navy hover:bg-transparent"
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
                            className="input input-bordered input-sm w-full border-divider bg-surface text-sm text-txt-main focus:border-navy focus:outline-none"
                        />
                    </FieldWrapper>
                    <FieldWrapper label={dateRange.toLabel ?? 'To Date'} widthClass="min-w-[180px]">
                        <input
                            type="date"
                            value={dateRange.toValue}
                            onChange={(e) => dateRange.onToChange(e.target.value)}
                            className="input input-bordered input-sm w-full border-divider bg-surface text-sm text-txt-main focus:border-navy focus:outline-none"
                        />
                    </FieldWrapper>
                </div>
            )}
        </div>
    );
}