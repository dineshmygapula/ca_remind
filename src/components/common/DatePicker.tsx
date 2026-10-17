// components/ui/DatePicker.tsx
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
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className = "",
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input input-bordered flex w-full items-center gap-2 text-left"
      >
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className={selected ? "" : "text-slate-400"}>
          {selected ? format(selected, "dd MMM yyyy") : placeholder}
        </span>
        {selected && (
          <X
            className="ml-auto w-4 h-4 text-slate-400 hover:text-slate-700"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 rounded-box border border-base-300 bg-base-100 shadow-lg">
          <DayPicker
            className="react-day-picker"
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(d) => {
              onChange(d ? format(d, "yyyy-MM-dd") : null);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
