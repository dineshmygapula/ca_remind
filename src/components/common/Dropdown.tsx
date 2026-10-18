"use client";

import { Check, ChevronDown } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly DropdownOption[];

  label?: string;
  placeholder?: string;
  disabled?: boolean;

  fullWidth?: boolean;

  className?: string;

  labelBgClass?: string;

  menuMaxHeightClass?: string;
}

function closeDropdown() {
  (document.activeElement as HTMLElement | null)?.blur();
}

export default function Dropdown({
  value,
  onChange,
  options,
  label,
  placeholder = "Select...",
  disabled = false,
  fullWidth = false,
  className = "",
  labelBgClass = "bg-surface",
  menuMaxHeightClass = "max-h-60",
}: DropdownProps) {
  const selected = options.find((o) => o.value === value);
  const shownText = selected ? selected.label : placeholder;

  return (
    <div
      className={`dropdown group ${fullWidth ? "w-full" : "w-auto"} ${className}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") closeDropdown();
      }}
    >
      {label && (
        <span
          className={`pointer-events-none absolute left-3 top-0 z-10 -translate-y-1/2 whitespace-nowrap px-1 text-[11px] font-semibold leading-none text-txt-sub transition-colors group-focus-within:text-[var(--accent)] ${labelBgClass}`}
        >
          {label}
        </span>
      )}

      <div
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="listbox"
        aria-disabled={disabled}
        className={`flex h-10 min-w-28 cursor-pointer items-center justify-between gap-2 rounded-xl border border-divider bg-bg/60 pl-3.5 pr-2.5 text-sm font-medium text-txt-main transition-all hover:bg-[var(--border)]/50 focus:border-[var(--accent)] focus:bg-surface focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15 ${
          fullWidth ? "w-full" : ""
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <span className="grid min-w-0 flex-1">
          {options.map((o) => (
            <span
              key={o.value}
              aria-hidden
              className="invisible col-start-1 row-start-1 h-0 overflow-hidden whitespace-nowrap"
            >
              {o.label}
            </span>
          ))}
          <span
            className={`col-start-1 row-start-1 truncate ${
              selected ? "" : "text-txt-sub/60"
            }`}
          >
            {shownText}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-txt-sub transition-transform duration-200 group-focus-within:rotate-180" />
      </div>

      <ul
        tabIndex={0}
        role="listbox"
        className={`dropdown-content z-50 mt-1.5 w-max min-w-full max-w-xs overflow-y-auto rounded-xl border border-divider bg-surface p-1 shadow-lg ${menuMaxHeightClass}`}
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;

          return (
            <li key={opt.value} role="option" aria-selected={isSelected}>
              <button
                type="button"
                disabled={opt.disabled}
                onClick={() => {
                  onChange(opt.value);
                  closeDropdown();
                }}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected
                    ? "bg-[var(--accent)]/12 font-semibold text-[var(--heading)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--border)]/50"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
