// components/grid/DateCellEditor.tsx
"use client";
import { forwardRef, useImperativeHandle, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import type { CustomCellEditorProps } from "ag-grid-react";

export const DateCellEditor = forwardRef<any, CustomCellEditorProps>(
  (props, ref) => {
    const initial = props.value ? parseISO(props.value) : undefined;
    const [date, setDate] = useState<Date | undefined>(
      initial && isValid(initial) ? initial : undefined,
    );

    useImperativeHandle(ref, () => ({
      getValue: () => (date ? format(date, "yyyy-MM-dd") : null),
    }));

    return (
      <div className="rounded-box border border-base-300 bg-base-100 shadow-lg">
        <DayPicker
          className="react-day-picker"
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(d) => {
            setDate(d);
            // stop editing after the state updates
            setTimeout(() => props.stopEditing?.(), 0);
          }}
        />
      </div>
    );
  },
);
DateCellEditor.displayName = "DateCellEditor";
