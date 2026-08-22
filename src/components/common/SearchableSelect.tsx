'use client';

import { useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { ChevronDown, Loader2, Search } from 'lucide-react';

export interface SearchableSelectProps<T> {
    options: T[];
    value: T | null;
    onChange: (value: T | null) => void;
    getOptionLabel: (option: T) => string;
    getOptionKey: (option: T) => string;
    renderOption?: (option: T) => ReactNode;
    loading?: boolean;
    placeholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
}

export default function SearchableSelect<T>({
    options,
    value,
    onChange,
    getOptionLabel,
    getOptionKey,
    renderOption,
    loading = false,
    placeholder = 'Search...',
    emptyMessage = 'No results found',
    disabled = false,
}: SearchableSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = useMemo(() => {
        if (!query.trim()) return options;
        const q = query.toLowerCase();
        return options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(q));
    }, [options, query, getOptionLabel]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-divider bg-surface px-3 text-left text-sm text-txt-main transition-colors focus:border-navy disabled:opacity-60"
            >
                <span className={`truncate ${value ? 'text-txt-main' : 'text-txt-sub/70'}`}>
                    {value ? getOptionLabel(value) : placeholder}
                </span>
                {loading ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-txt-sub" />
                ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-txt-sub" />
                )}
            </button>

            {open && !disabled && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-divider bg-surface shadow-lg">
                    <div className="relative border-b border-divider p-2">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-txt-sub" />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full rounded-md border-none bg-bg py-1.5 pl-7 pr-2 text-sm text-txt-main outline-none"
                        />
                    </div>

                    <ul className="max-h-56 overflow-y-auto py-1">
                        {loading ? (
                            <li className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-txt-sub">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                            </li>
                        ) : filtered.length === 0 ? (
                            <li className="px-3 py-4 text-center text-xs text-txt-sub">{emptyMessage}</li>
                        ) : (
                            filtered.map((opt) => (
                                <li key={getOptionKey(opt)}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(opt);
                                            setOpen(false);
                                            setQuery('');
                                        }}
                                        className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-bg"
                                    >
                                        {renderOption ? renderOption(opt) : getOptionLabel(opt)}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}