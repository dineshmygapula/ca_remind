'use client';

import { useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { ChevronDown, Loader2, Search, X, Check } from 'lucide-react';

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
    /** 'inline' expands in the document flow (default — safe inside drawers/modals).
     *  'float' uses absolute positioning (for use in pages where overflow is not clipped). */
    variant?: 'inline' | 'float';
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
    variant = 'inline',
}: SearchableSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    // Focus search when opening
    useEffect(() => {
        if (open) {
            setTimeout(() => searchRef.current?.focus(), 50);
        } else {
            setQuery('');
        }
    }, [open]);

    const filtered = useMemo(() => {
        if (!query.trim()) return options;
        const q = query.toLowerCase();
        return options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(q));
    }, [options, query, getOptionLabel]);

    // ── Shared panel JSX ──────────────────────────────────────────────────────

    const panel = (
        <div
            className={[
                'overflow-hidden rounded-xl border border-[var(--accent)]/30',
                'bg-[var(--surface)] shadow-xl',
                variant === 'inline'
                    ? 'mt-2 animate-in slide-in-from-top-2 fade-in-0 duration-150'
                    : 'absolute z-50 mt-1.5 w-full animate-in slide-in-from-top-2 fade-in-0 duration-150',
            ].join(' ')}
        >
            {/* Search bar */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--border)] bg-[var(--bg)]">
                <Search className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type to search..."
                    className={[
                        'flex-1 bg-transparent text-sm outline-none',
                        'text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50',
                    ].join(' ')}
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="shrink-0 rounded-md p-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]/60 transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* Count pill */}
            {!loading && filtered.length > 0 && (
                <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]/60">
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}

            {/* Options list */}
            <ul className="max-h-52 overflow-y-auto pb-1.5 px-1.5">
                {loading ? (
                    <li className="flex items-center justify-center gap-2 py-6 text-xs text-[var(--text-secondary)]">
                        <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                        <span>Loading options…</span>
                    </li>
                ) : filtered.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-[var(--text-secondary)]">
                        {emptyMessage}
                    </li>
                ) : (
                    filtered.map((opt) => {
                        const isSelected = value && getOptionKey(value) === getOptionKey(opt);
                        return (
                            <li key={getOptionKey(opt)}>
                                <button
                                    type="button"
                                    onClick={() => { onChange(opt); setOpen(false); }}
                                    className={[
                                        'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-all',
                                        isSelected
                                            ? 'bg-[var(--accent)]/12 text-[var(--heading)] font-semibold'
                                            : 'text-[var(--text-primary)] hover:bg-[var(--border)]/50',
                                    ].join(' ')}
                                >
                                    {/* Check indicator */}
                                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                                        isSelected
                                            ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                            : 'border-[var(--border)] group-hover:border-[var(--accent)]/40'
                                    }`}>
                                        {isSelected && <Check className="h-2.5 w-2.5" />}
                                    </span>

                                    <span className="flex-1 min-w-0">
                                        {renderOption ? renderOption(opt) : (
                                            <span className="truncate block">{getOptionLabel(opt)}</span>
                                        )}
                                    </span>
                                </button>
                            </li>
                        );
                    })
                )}
            </ul>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div ref={containerRef} className={variant === 'float' ? 'relative' : 'w-full'}>
            {/* Trigger button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className={[
                    'flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-medium transition-all',
                    'border bg-[var(--surface)]',
                    open
                        ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20 shadow-sm'
                        : 'border-[var(--border)] hover:border-[var(--accent)]/50',
                    'focus:outline-none',
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
            >
                {/* Left: value or placeholder */}
                <span className={`truncate ${value ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]/60'}`}>
                    {value ? getOptionLabel(value) : placeholder}
                </span>

                {/* Right: clear + chevron */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    {value && !disabled && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); onChange(null); setQuery(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onChange(null))}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition-colors"
                            aria-label="Clear selection"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                    {loading
                        ? <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                        : <ChevronDown className={`h-4 w-4 text-[var(--text-secondary)] transition-transform duration-200 ${open ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                    }
                </div>
            </button>

            {/* Panel */}
            {open && !disabled && panel}
        </div>
    );
}