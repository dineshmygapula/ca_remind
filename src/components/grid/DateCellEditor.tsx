"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import type { CustomCellEditorProps } from "ag-grid-react";
import { parseDate } from "@/utils/formatDate";

// Sizing + accent come from the library's own CSS variables.
const PICKER_VARS = {
  "--rdp-accent-color": "var(--accent)",
  "--rdp-accent-background-color":
    "color-mix(in srgb, var(--accent) 12%, transparent)",
  "--rdp-day-height": "38px",
  "--rdp-day-width": "38px",
  "--rdp-day_button-height": "36px",
  "--rdp-day_button-width": "36px",
  "--rdp-day_button-border-radius": "10px",
  "--rdp-day_button-border": "1.5px solid transparent",
  "--rdp-selected-border": "1.5px solid var(--accent)",
  "--rdp-weekday-opacity": "1",
} as CSSProperties;

const footerBtn =
  "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export const DateCellEditor = forwardRef<unknown, CustomCellEditorProps>(
  (props, ref) => {
    const dc = getDefaultClassNames();

    const initial = parseDate(props.value as string | null) ?? undefined;
    const [date, setDate] = useState<Date | undefined>(initial);

    // Starts as the ORIGINAL value, so closing the popup without picking
    // anything leaves the cell unchanged instead of wiping it.
    const valueRef = useRef<unknown>(props.value ?? null);

    // Legacy (ref-based) editor API
    useImperativeHandle(ref, () => ({
      getValue: () => valueRef.current,
      isPopup: () => true,
    }));

    const commit = (next: string | null) => {
      valueRef.current = next;
      // Reactive editor API (AG Grid 32+/33). Cast keeps older versions compiling.
      (props as { onValueChange?: (value: unknown) => void }).onValueChange?.(
        next,
      );
      setTimeout(() => props.stopEditing(), 0);
    };

    return (
      <div className="z-50 rounded-2xl border border-divider bg-surface p-3 text-txt-main shadow-xl">
        <DayPicker
          mode="single"
          required
          style={PICKER_VARS}
          selected={date}
          defaultMonth={date ?? new Date()}
          onSelect={(d) => {
            setDate(d);
            commit(format(d, "yyyy-MM-dd"));
          }}
          classNames={{
            caption_label: `${dc.caption_label} text-[15px] font-bold text-[var(--heading)]`,
            weekday: `${dc.weekday} text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]`,
            chevron: `${dc.chevron} fill-[var(--text-secondary)]`,
            button_previous: `${dc.button_previous} rounded-lg transition-colors hover:bg-[var(--border)]/50`,
            button_next: `${dc.button_next} rounded-lg transition-colors hover:bg-[var(--border)]/50`,
            day_button: `${dc.day_button} cursor-pointer text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--border)]/50`,
            today: `${dc.today} [&:not(.rdp-selected)>button]:font-bold [&:not(.rdp-selected)>button]:text-[var(--accent)]`,
            selected: `${dc.selected} [&>button]:bg-[var(--accent)] [&>button]:text-white [&>button:hover]:bg-[var(--accent)]`,
          }}
        />

        <div className="mt-1 flex items-center justify-between border-t border-divider pt-2.5">
          <button
            type="button"
            disabled={!date}
            onClick={() => {
              setDate(undefined);
              commit(null);
            }}
            className={`${footerBtn} text-[var(--text-secondary)] hover:bg-[var(--border)]/50 hover:text-[var(--heading)]`}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              setDate(today);
              commit(format(today, "yyyy-MM-dd"));
            }}
            className={`${footerBtn} text-[var(--accent)] hover:bg-[var(--accent)]/10`}
          >
            Today
          </button>
        </div>
      </div>
    );
  },
);
DateCellEditor.displayName = "DateCellEditor";
