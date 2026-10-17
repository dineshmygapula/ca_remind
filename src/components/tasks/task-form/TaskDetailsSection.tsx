"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import DrawerSection from "@/components/common/DrawerSection";
import Dropdown from "@/components/common/Dropdown";
import { DatePicker } from "@/components/common/DatePicker";
import { TextareaField } from "@/components/ui/TextareaField";
import SearchableSelect from "@/components/common/SearchableSelect";
import { TASK_TYPES, FREQUENCY_OPTIONS } from "@/constants/taskConstants";
import { StaffMember } from "@/types/staff.types";
import { MessageTemplateListItem } from "@/types/messageTemplate.types";
import { TaskPriority } from "@/types/task.types";
import { TaskFormValues } from "@/utils/schema";

interface TaskDetailsSectionProps {
  staff: StaffMember[];
  staffLoading: boolean;
  selectedStaff: StaffMember | null;
  onSelectStaff: (staff: StaffMember | null) => void;
  taskDefinitions: any[];
  templates: MessageTemplateListItem[];
  onAutoSelectTemplate: (tpl: MessageTemplateListItem) => void;
  generatedTitle: string;
}

export default function TaskDetailsSection({
  staff,
  staffLoading,
  selectedStaff,
  onSelectStaff,
  taskDefinitions,
  templates,
  onAutoSelectTemplate,
  generatedTitle,
}: TaskDetailsSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TaskFormValues>();

  const watchedTaskType = watch("taskType");
  const watchedFrequency = watch("frequency");
  const watchedPriority = watch("priority");
  const watchedDueDate = watch("dueDate");
  const watchedDaysBefore = watch("daysBeforeDueDate");
  const watchedTemplateId = watch("templateId");

  const handleTaskTypeChange = (newType: string) => {
    setValue("taskType", newType, { shouldValidate: true, shouldDirty: true });
    if (!newType) return;

    // Auto-match task definition for priority + schedule pattern
    if (taskDefinitions.length > 0) {
      const matched = taskDefinitions.find(
        (def) =>
          String(def.taskType).trim().toUpperCase() ===
          newType.trim().toUpperCase(),
      );
      if (matched) {
        setValue("taskDefinitionId", matched.id);
        if (matched.priority) {
          setValue("priority", matched.priority as TaskPriority);
        }
        if (matched.schedulePattern) {
          setValue("frequency", matched.schedulePattern);
        }
      }
    }

    // Auto-suggest template if not already picked
    if (!watchedTemplateId && templates.length > 0) {
      const q = newType.split("_")[0].toLowerCase();
      const matchedTemplate = templates.find((t) =>
        t.name?.toLowerCase().includes(q),
      );
      if (matchedTemplate) {
        setValue("templateId", matchedTemplate.id, { shouldValidate: true });
        onAutoSelectTemplate(matchedTemplate);
      }
    }
  };

  const handleDueDateChange = (d: string | null) => {
    const val = d || "";
    setValue("dueDate", val, { shouldValidate: true, shouldDirty: true });
    if (!val) return;
    const daysLeft = Math.floor(
      (new Date(val).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000,
    );
    if (daysLeft > 0 && Number(watchedDaysBefore) > daysLeft) {
      setValue("daysBeforeDueDate", 1);
    }
  };

  return (
    <DrawerSection step={2} title="Task and compliance" required>
      {/* Task Type & Frequency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Task Type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            fullWidth
            value={watchedTaskType}
            placeholder="Select type"
            options={TASK_TYPES.map((t) => ({
              value: t.label,
              label: t.label,
            }))}
            onChange={handleTaskTypeChange}
          />
          {errors.taskType && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.taskType.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Frequency <span className="text-red-500">*</span>
          </label>
          <Dropdown
            fullWidth
            value={watchedFrequency}
            placeholder="Select frequency"
            options={FREQUENCY_OPTIONS}
            onChange={(val) => {
              setValue("frequency", val, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.frequency && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.frequency.message}
            </p>
          )}
        </div>
      </div>

      {/* Due Date (DatePicker) & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Due Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={watchedDueDate}
            onChange={handleDueDateChange}
            placeholder="Pick due date"
          />
          {errors.dueDate && (
            <p className="mt-1 text-xs font-medium leading-4 text-red-500">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-txt-main">
            Priority
          </label>
          <Dropdown
            fullWidth
            value={watchedPriority}
            placeholder="Select priority"
            options={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "URGENT", label: "Urgent" },
            ]}
            onChange={(val) => {
              setValue("priority", val as TaskPriority, {
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

      {/* Task Title (Auto-generated Read-only) */}
      <div>
        <label className="block text-xs font-semibold text-txt-main mb-1.5">
          Task Title
        </label>
        <input
          type="text"
          readOnly
          value={generatedTitle}
          placeholder="Auto-generated based on client & type"
          className="w-full h-11 rounded-xl border border-divider bg-bg/70 px-3.5 text-sm font-medium text-txt-main placeholder:text-txt-sub/50 outline-none cursor-default"
        />
      </div>

      {/* Assigned Staff */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-txt-main">
          Assigned To
        </label>
        <SearchableSelect
          options={staff}
          value={selectedStaff}
          onChange={(member) => {
            onSelectStaff(member);
            setValue("assignedStaffId", member?.id ?? "", {
              shouldDirty: true,
            });
          }}
          getOptionLabel={(m) =>
            [m.firstName, m.lastName].filter(Boolean).join(" ") ||
            m.email ||
            m.id
          }
          getOptionKey={(m) => m.id}
          loading={staffLoading}
          placeholder="Search and select employee"
          emptyMessage={
            staff.length === 0
              ? "No staff found. Add a staff member first."
              : "No matching staff"
          }
        />
      </div>

      {/* Notes */}
      <TextareaField
        name="notes"
        label="Notes"
        placeholder="Add any relevant notes or instructions..."
        rows={3}
      />
    </DrawerSection>
  );
}
