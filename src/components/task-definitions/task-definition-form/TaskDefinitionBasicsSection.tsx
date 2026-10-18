"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import DrawerSection from "@/components/common/DrawerSection";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";
import { InputField } from "@/components/ui/InputField";
import { TextareaField } from "@/components/ui/TextareaField";
import {
  SUBJECT_TYPE_OPTIONS,
  TASK_CATEGORIES,
  TASK_TYPES,
  PRIORITY_OPTIONS,
} from "@/constants/taskDefinition.constants";
import { TaskPriority } from "@/types/taskDefinition.types";
import { TaskDefinitionFormValues } from "@/utils/schema";

const TASK_TYPE_OPTIONS: readonly DropdownOption[] = TASK_TYPES.map((t) => ({
  value: t,
  label: t,
}));

const CATEGORY_OPTIONS: readonly DropdownOption[] = [
  { value: "", label: "Select category" },
  ...TASK_CATEGORIES.map((c) => ({
    value: c,
    label: c,
  })),
];

const SUBJECT_OPTIONS: readonly DropdownOption[] = SUBJECT_TYPE_OPTIONS.map(
  (o) => ({
    value: o.value,
    label: o.label,
  })
);

const PRIORITY_DROPDOWN_OPTIONS: readonly DropdownOption[] =
  PRIORITY_OPTIONS.map((p) => ({
    value: p.value,
    label: `● ${p.label}`,
  }));

export default function TaskDefinitionBasicsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TaskDefinitionFormValues>();

  const watchedTaskType = watch("taskType");
  const watchedCategory = watch("category");
  const watchedSubjectType = watch("subjectType");
  const watchedPriority = watch("priority");
  const watchedDescription = watch("description");

  return (
    <DrawerSection step={1} title="Basics" required>
      {/* Rule name */}
      <InputField
        name="name"
        label="Rule name"
        required
        placeholder="e.g. GST_MONTHLY_FILING"
      />

      {/* Task Type & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Task type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            fullWidth
            value={watchedTaskType || ""}
            placeholder="Select task type"
            options={TASK_TYPE_OPTIONS}
            onChange={(val) => {
              setValue("taskType", val, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.taskType && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.taskType.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Category
          </label>
          <Dropdown
            fullWidth
            value={watchedCategory || ""}
            placeholder="Select category"
            options={CATEGORY_OPTIONS}
            onChange={(val) => {
              setValue("category", val, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.category && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* Applies to & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Applies to <span className="text-red-500">*</span>
          </label>
          <Dropdown
            fullWidth
            value={watchedSubjectType || "CLIENT"}
            placeholder="Select recipient type"
            options={SUBJECT_OPTIONS}
            onChange={(val) => {
              setValue("subjectType", val, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.subjectType && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.subjectType.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Priority
          </label>
          <Dropdown
            fullWidth
            value={watchedPriority || "MEDIUM"}
            placeholder="Select priority"
            options={PRIORITY_DROPDOWN_OPTIONS}
            onChange={(val) => {
              setValue("priority", val as TaskPriority, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.priority && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.priority.message}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5 mt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-txt-main">
            Description
          </label>
          <span className="text-[11px] text-txt-sub">
            {(watchedDescription || "").length} / 240
          </span>
        </div>
        <TextareaField
          name="description"
          rows={3}
          maxLength={240}
          placeholder="Describe the compliance rule or add notes"
        />
      </div>
    </DrawerSection>
  );
}
