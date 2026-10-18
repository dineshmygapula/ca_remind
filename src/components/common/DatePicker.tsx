"use client";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import { Calendar, X } from "lucide-react";

type Props = {
  value?: string | null; // "yyyy-MM-dd"
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  /** Optional floating label on the border, matching Dropdown */
  label?: string;
  /** Disable days (react-day-picker Matcher), e.g. { before: someDate } */
  disabled?: React.ComponentProps<typeof DayPicker>["disabled"];
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className = "",
  label,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <span className="pointer-events-none absolute -top-2 left-3 z-10 bg-surface px-1 text-xs font-medium text-txt-main">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border bg-bg/60 px-3 text-left text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/15 ${
          open
            ? "border-blue-500 bg-surface"
            : "border-divider hover:bg-surface"
        }`}
      >
        <Calendar className="h-4 w-4 shrink-0 text-txt-sub" />
        <span
          className={`truncate ${selected ? "text-txt-main" : "text-txt-sub/60"}`}
        >
          {selected ? format(selected, "dd MMM yyyy") : placeholder}
        </span>
        {selected && (
          <X
            className="ml-auto h-4 w-4 shrink-0 text-txt-sub hover:text-txt-main"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 rounded-2xl border border-divider bg-surface p-3 shadow-lg">
          {" "}
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected}
            disabled={disabled}
            showOutsideDays
            onSelect={(d) => {
              onChange(d ? format(d, "yyyy-MM-dd") : null);
              setOpen(false);
            }}
            classNames={{
              root: "text-txt-main text-sm",
              months: "relative flex flex-col",
              month: "space-y-2",
              month_caption: "flex h-9 items-center justify-center",
              caption_label: "text-sm font-bold text-txt-main",
              nav: "absolute inset-x-0 top-0 flex items-center justify-between",
              button_previous:
                "grid h-9 w-9 place-items-center rounded-lg text-txt-sub hover:bg-bg hover:text-txt-main cursor-pointer transition-colors",
              button_next:
                "grid h-9 w-9 place-items-center rounded-lg text-txt-sub hover:bg-bg hover:text-txt-main cursor-pointer transition-colors",
              chevron: "h-4 w-4 fill-current",
              month_grid: "border-collapse",
              weekdays: "flex",
              weekday:
                "h-8 w-9 text-center text-[11px] font-semibold uppercase tracking-wide text-txt-sub",
              week: "mt-1 flex",
              day: "h-9 w-9 p-0 text-center",
              day_button:
                "h-9 w-9 rounded-lg text-sm font-medium text-txt-main transition-colors hover:bg-bg cursor-pointer disabled:cursor-not-allowed",
              selected:
                "[&>button]:bg-navy [&>button]:text-white [&>button]:font-semibold [&>button]:hover:bg-navy-hover dark:[&>button]:bg-gold dark:[&>button]:text-bg dark:[&>button]:hover:bg-gold-hover",
              today: "[&>button]:text-gold-hover [&>button]:font-bold",
              outside: "[&>button]:text-txt-sub/40",
              disabled:
                "[&>button]:text-txt-sub/30 [&>button]:hover:bg-transparent",
            }}
          />
        </div>
      )}
    </div>
  );
}
