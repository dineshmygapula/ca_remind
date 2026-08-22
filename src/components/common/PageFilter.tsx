'use client';

import { DATE_RANGE_ENABLED_BY_TYPE, FILTER_FIELDS_BY_TYPE, FilterPageType, SEARCH_PLACEHOLDER_BY_TYPE } from "@/constants/filterFields";
import FilterBar from "./Filter";


export interface DateRangeValue {
    fromValue: string;
    toValue: string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
}

export interface PageFilterBarProps {
    /** Drives which dropdowns render — see FILTER_FIELDS_BY_TYPE */
    type: FilterPageType;

    search: string;
    onSearchChange: (value: string) => void;

    /** Current value per filter key, e.g. { status: 'ALL', taskType: 'GST' } */
    values: Record<string, string>;
    /** Called with (fieldKey, newValue) whenever any dropdown changes */
    onChange: (key: string, value: string) => void;

    /** Only rendered when the page's type has date-range enabled AND this is passed */
    dateRange?: DateRangeValue;

    onReset?: () => void;
    className?: string;
}

export default function PageFilterBar({
    type,
    search,
    onSearchChange,
    values,
    onChange,
    dateRange,
    onReset,
    className,
}: PageFilterBarProps) {
    const fieldDefs = FILTER_FIELDS_BY_TYPE[type] ?? [];

    const filters = fieldDefs.map((field) => ({
        key: field.key,
        label: field.label,
        value: values[field.key] ?? field.options[0]?.value ?? 'ALL',
        options: field.options,
        onChange: (value: string) => onChange(field.key, value),
    }));

    const wantsDateRange = DATE_RANGE_ENABLED_BY_TYPE[type];

    return (
        <FilterBar
            searchValue={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={SEARCH_PLACEHOLDER_BY_TYPE[type]}
            filters={filters}
            dateRange={wantsDateRange ? dateRange : undefined}
            onReset={onReset}
            className={className}
        />
    );
}