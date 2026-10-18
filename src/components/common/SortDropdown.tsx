"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

export interface SortDropdownProps {
  value: string;
  options: { key: string; label: string }[];
  onChange: (key: string) => void;
}

export default function SortDropdown({ value, options, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.key === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-divider bg-surface px-3.5 py-1.5 text-sm font-medium text-txt-main shadow-xs transition-colors hover:bg-bg"
      >
        <Calendar className="h-4 w-4 text-txt-sub" />
        <span>{current?.label}</span>
        <ChevronDown className="h-4 w-4 text-txt-sub" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-divider bg-surface p-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  value === option.key
                    ? "bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                    : "text-txt-main hover:bg-bg"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}