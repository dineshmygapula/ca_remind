"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import DrawerSection from "@/components/common/DrawerSection";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";
import { InputField } from "@/components/ui/InputField";
import {
  REMINDER_TYPE_OPTIONS,
  BUSINESS_CATEGORY_OPTIONS,
} from "@/constants/messageTemplateConstants";
import { TemplateFormValues } from "@/utils/schema";

const REMINDER_OPTIONS: readonly DropdownOption[] = REMINDER_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

const CATEGORY_OPTIONS: readonly DropdownOption[] = BUSINESS_CATEGORY_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export default function TemplateInfoSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TemplateFormValues>();

  const watchedReminderType = watch("reminderType");
  const watchedBusinessCategory = watch("businessCategory");
  const watchedIsActive = watch("isActive");

  return (
    <DrawerSection step={1} title="Template Information" required>
      {/* Template Name */}
      <InputField
        name="name"
        label="Template Name"
        required
        placeholder="e.g. GST Filing Due Reminder"
      />

      {/* Reminder Type & Business Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Reminder Type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            fullWidth
            value={watchedReminderType}
            placeholder="Select type"
            options={REMINDER_OPTIONS}
            onChange={(val) => {
              setValue("reminderType", val, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.reminderType && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.reminderType.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Business Category <span className="text-red-500">*</span>
          </label>
          <Dropdown
            fullWidth
            value={watchedBusinessCategory}
            placeholder="Select category"
            options={CATEGORY_OPTIONS}
            onChange={(val) => {
              setValue("businessCategory", val, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.businessCategory && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.businessCategory.message}
            </p>
          )}
        </div>
      </div>

      {/* Active Status Toggle */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div>
          <p className="text-xs font-bold text-txt-main">Active Status</p>
          <p className="text-[11px] text-txt-sub">Enable or disable this template across reminders</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setValue("isActive", !watchedIsActive, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          className="flex items-center gap-2 cursor-pointer select-none bg-transparent border-0 p-0"
        >
          <div
            className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
              watchedIsActive ? "bg-[#14224D]" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                watchedIsActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span
            className={`text-xs font-semibold ${
              watchedIsActive ? "text-[#059669]" : "text-txt-sub"
            }`}
          >
            {watchedIsActive ? "Active" : "Inactive"}
          </span>
        </button>
      </div>
    </DrawerSection>
  );
}
