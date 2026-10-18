"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import DrawerSection from "@/components/common/DrawerSection";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";
import { DatePicker } from "@/components/common/DatePicker";
import { InputField } from "@/components/ui/InputField";
import { MONTHS, DAYS } from "@/constants/taskDefinition.constants";
import { SchedulePattern } from "@/types/taskDefinition.types";
import { TaskDefinitionFormValues } from "@/utils/schema";

const REPEATS_TABS: { label: string; value: SchedulePattern }[] = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Half-Yearly", value: "half_yearly" },
  { label: "Yearly", value: "yearly" },
  { label: "One Time", value: "one_time" },
];

const MONTH_OPTIONS: readonly DropdownOption[] = MONTHS.map((m) => ({
  value: String(m.value),
  label: m.label,
}));

const DAY_OPTIONS: readonly DropdownOption[] = DAYS.map((d) => ({
  value: String(d.value),
  label: `Day ${d.label}`,
}));

export default function TaskDefinitionScheduleSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TaskDefinitionFormValues>();

  const watchedSchedulePattern = watch("schedulePattern");
  const watchedMonthlyDay = watch("monthlyDay");
  const watchedQ1Month = watch("q1Month");
  const watchedQ1Day = watch("q1Day");
  const watchedQ2Month = watch("q2Month");
  const watchedQ2Day = watch("q2Day");
  const watchedQ3Month = watch("q3Month");
  const watchedQ3Day = watch("q3Day");
  const watchedQ4Month = watch("q4Month");
  const watchedQ4Day = watch("q4Day");
  const watchedH1Month = watch("h1Month");
  const watchedH1Day = watch("h1Day");
  const watchedH2Month = watch("h2Month");
  const watchedH2Day = watch("h2Day");
  const watchedYearlyMonth = watch("yearlyMonth");
  const watchedYearlyDay = watch("yearlyDay");
  const watchedOneTimeDueDate = watch("oneTimeDueDate");

  const quarterlyQuarters = [
    {
      label: "Q1 (Apr – Jun)",
      mValue: String(watchedQ1Month ?? 4),
      dValue: String(watchedQ1Day ?? 30),
      onMChange: (v: string) => setValue("q1Month", Number(v), { shouldDirty: true }),
      onDChange: (v: string) => setValue("q1Day", Number(v), { shouldDirty: true }),
    },
    {
      label: "Q2 (Jul – Sep)",
      mValue: String(watchedQ2Month ?? 7),
      dValue: String(watchedQ2Day ?? 31),
      onMChange: (v: string) => setValue("q2Month", Number(v), { shouldDirty: true }),
      onDChange: (v: string) => setValue("q2Day", Number(v), { shouldDirty: true }),
    },
    {
      label: "Q3 (Oct – Dec)",
      mValue: String(watchedQ3Month ?? 10),
      dValue: String(watchedQ3Day ?? 31),
      onMChange: (v: string) => setValue("q3Month", Number(v), { shouldDirty: true }),
      onDChange: (v: string) => setValue("q3Day", Number(v), { shouldDirty: true }),
    },
    {
      label: "Q4 (Jan – Mar)",
      mValue: String(watchedQ4Month ?? 1),
      dValue: String(watchedQ4Day ?? 31),
      onMChange: (v: string) => setValue("q4Month", Number(v), { shouldDirty: true }),
      onDChange: (v: string) => setValue("q4Day", Number(v), { shouldDirty: true }),
    },
  ];

  const halfYearlyHalves = [
    {
      label: "First Half (Apr – Sep)",
      mValue: String(watchedH1Month ?? 4),
      dValue: String(watchedH1Day ?? 30),
      onMChange: (v: string) => setValue("h1Month", Number(v), { shouldDirty: true }),
      onDChange: (v: string) => setValue("h1Day", Number(v), { shouldDirty: true }),
    },
    {
      label: "Second Half (Oct – Mar)",
      mValue: String(watchedH2Month ?? 10),
      dValue: String(watchedH2Day ?? 31),
      onMChange: (v: string) => setValue("h2Month", Number(v), { shouldDirty: true }),
      onDChange: (v: string) => setValue("h2Day", Number(v), { shouldDirty: true }),
    },
  ];

  return (
    <DrawerSection step={2} title="Schedule" required>
      {/* Repeats Segmented Toggle */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-txt-main">
          Repeats <span className="text-red-500">*</span>
        </label>
        <div className="bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] flex items-center gap-1">
          {REPEATS_TABS.map((tab) => {
            const isSelected = watchedSchedulePattern === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  setValue("schedulePattern", tab.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0F1E36] dark:bg-navy text-white shadow-xs"
                    : "text-txt-sub hover:text-txt-main"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly details */}
      {watchedSchedulePattern === "monthly" && (
        <div className="flex flex-col gap-1.5 pt-3 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Day of Month (due day)
          </label>
          <Dropdown
            fullWidth
            value={String(watchedMonthlyDay ?? 10)}
            placeholder="Select day"
            options={DAY_OPTIONS}
            onChange={(val) => {
              setValue("monthlyDay", Number(val), {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
        </div>
      )}

      {/* Quarterly details */}
      {watchedSchedulePattern === "quarterly" && (
        <div className="space-y-3 pt-3">
          {quarterlyQuarters.map(({ label, mValue, dValue, onMChange, onDChange }) => (
            <div
              key={label}
              className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 space-y-2"
            >
              <p className="text-xs font-bold text-txt-main">{label}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-txt-sub">
                    Month
                  </label>
                  <Dropdown
                    fullWidth
                    value={mValue}
                    options={MONTH_OPTIONS}
                    onChange={onMChange}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-txt-sub">
                    Day
                  </label>
                  <Dropdown
                    fullWidth
                    value={dValue}
                    options={DAY_OPTIONS}
                    onChange={onDChange}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Half-Yearly details */}
      {watchedSchedulePattern === "half_yearly" && (
        <div className="space-y-3 pt-3">
          {halfYearlyHalves.map(({ label, mValue, dValue, onMChange, onDChange }) => (
            <div
              key={label}
              className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/40 space-y-2"
            >
              <p className="text-xs font-bold text-txt-main">{label}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-txt-sub">
                    Month
                  </label>
                  <Dropdown
                    fullWidth
                    value={mValue}
                    options={MONTH_OPTIONS}
                    onChange={onMChange}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-txt-sub">
                    Day
                  </label>
                  <Dropdown
                    fullWidth
                    value={dValue}
                    options={DAY_OPTIONS}
                    onChange={onDChange}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yearly details */}
      {watchedSchedulePattern === "yearly" && (
        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-txt-main">
              Due Month
            </label>
            <Dropdown
              fullWidth
              value={String(watchedYearlyMonth ?? 7)}
              options={MONTH_OPTIONS}
              onChange={(val) => {
                setValue("yearlyMonth", Number(val), {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-txt-main">
              Due Day
            </label>
            <Dropdown
              fullWidth
              value={String(watchedYearlyDay ?? 31)}
              options={DAY_OPTIONS}
              onChange={(val) => {
                setValue("yearlyDay", Number(val), {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
          </div>
        </div>
      )}

      {/* One-Time details */}
      {watchedSchedulePattern === "one_time" && (
        <div className="flex flex-col gap-1.5 pt-3 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Due Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={watchedOneTimeDueDate}
            onChange={(d) => {
              setValue("oneTimeDueDate", d || "", {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            placeholder="Pick due date"
          />
          {errors.oneTimeDueDate && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.oneTimeDueDate.message}
            </p>
          )}
        </div>
      )}

      {/* Target offset days */}
      <div className="pt-3">
        <InputField
          name="targetOffsetDays"
          type="number"
          min={-365}
          max={365}
          label="Target Offset Days (days before due date)"
        />
      </div>
    </DrawerSection>
  );
}
