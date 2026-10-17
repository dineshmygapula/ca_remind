"use client";

import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Pencil, Plus, AlertCircle, X, Loader2 } from "lucide-react";
import Drawer from "@/components/common/Drawer";
import { FormWrapper } from "@/components/wrappers/FormWrapper";
import { useAsyncAction } from "@/hooks/useAnyAction";
import {
  getTaskDefinitionById,
  updateTaskDefinition,
  createTaskDefinition,
} from "@/services/taskDefinitionService";
import {
  TaskDefinition,
  CreateTaskDefinitionDto,
  UpdateTaskDefinitionDto,
  ScheduleRule,
  TaskPriority,
} from "@/types/taskDefinition.types";
import {
  taskDefinitionSchema,
  TaskDefinitionFormValues,
} from "@/utils/schema";

import TaskDefinitionBasicsSection from "./task-definition-form/TaskDefinitionBasicsSection";
import TaskDefinitionScheduleSection from "./task-definition-form/TaskDefinitionScheduleSection";
import TaskDefinitionAutomationSection from "./task-definition-form/TaskDefinitionAutomationSection";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TaskDefinitionFormDrawerProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  definitionId?: string | null;
  onSuccess?: () => void;
}

const TASK_DEFINITION_FORM_ID = "task-definition-form";

const DEFAULT_FORM_VALUES: TaskDefinitionFormValues = {
  name: "",
  taskType: "",
  description: "",
  category: "",
  subjectType: "CLIENT",
  priority: "MEDIUM",
  schedulePattern: "monthly",
  monthlyDay: 10,
  q1Month: 4,
  q1Day: 30,
  q2Month: 7,
  q2Day: 31,
  q3Month: 10,
  q3Day: 31,
  q4Month: 1,
  q4Day: 31,
  h1Month: 4,
  h1Day: 30,
  h2Month: 10,
  h2Day: 31,
  yearlyMonth: 7,
  yearlyDay: 31,
  oneTimeDueDate: "",
  targetOffsetDays: 0,
  isActive: true,
  autoCreateTasks: true,
  autoCreateReminders: true,
};

function buildScheduleRule(values: TaskDefinitionFormValues): ScheduleRule {
  const rule: ScheduleRule = { pattern: values.schedulePattern };
  switch (values.schedulePattern) {
    case "monthly":
      rule.monthly = { day: Number(values.monthlyDay) };
      break;
    case "quarterly":
      rule.quarterly = {
        q1Month: Number(values.q1Month),
        q1Day: Number(values.q1Day),
        q2Month: Number(values.q2Month),
        q2Day: Number(values.q2Day),
        q3Month: Number(values.q3Month),
        q3Day: Number(values.q3Day),
        q4Month: Number(values.q4Month),
        q4Day: Number(values.q4Day),
      };
      break;
    case "half_yearly":
      rule.halfYearly = {
        firstHalf: {
          month: Number(values.h1Month),
          day: Number(values.h1Day),
        },
        secondHalf: {
          month: Number(values.h2Month),
          day: Number(values.h2Day),
        },
      };
      break;
    case "yearly":
      rule.yearly = {
        month: Number(values.yearlyMonth),
        day: Number(values.yearlyDay),
      };
      break;
    case "one_time":
      rule.oneTime = { dueDate: values.oneTimeDueDate || "" };
      break;
  }
  return rule;
}

// ─── Form Content Component ───────────────────────────────────────────────────

function TaskDefinitionFormContent({
  onTitleCalculated,
}: {
  onTitleCalculated: (title: string) => void;
}) {
  const { watch } = useFormContext<TaskDefinitionFormValues>();
  const watchedName = watch("name");

  useEffect(() => {
    onTitleCalculated(watchedName || "");
  }, [watchedName, onTitleCalculated]);

  return (
    <div className="space-y-4">
      <TaskDefinitionBasicsSection />
      <TaskDefinitionScheduleSection />
      <TaskDefinitionAutomationSection />
    </div>
  );
}

// ─── Main Drawer Component ────────────────────────────────────────────────────

export default function TaskDefinitionFormDrawer({
  open,
  onClose,
  businessId,
  definitionId,
  onSuccess,
}: TaskDefinitionFormDrawerProps) {
  const mode: "create" | "edit" = definitionId ? "edit" : "create";

  const [initialFormValues, setInitialFormValues] = useState<
    TaskDefinitionFormValues | undefined
  >(undefined);
  const [headerTitle, setHeaderTitle] = useState("");

  const saveAction = useAsyncAction();
  const fetchAction = useAsyncAction();

  // ── Fetch & Pre-fill when editing ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setInitialFormValues(undefined);
      setHeaderTitle("");
      return;
    }

    if (!definitionId || !businessId) return;

    fetchAction.run(
      async () => {
        const def: TaskDefinition = await getTaskDefinitionById(
          businessId,
          definitionId
        );
        const sched = def.scheduleRule;

        setHeaderTitle(def.name ?? "");

        setInitialFormValues({
          name: def.name ?? "",
          taskType: def.taskType ?? "",
          description: def.description ?? "",
          category: def.category ?? "",
          subjectType: def.subjectType ?? "CLIENT",
          priority: (def.priority ?? "MEDIUM") as TaskPriority,

          schedulePattern: sched?.pattern ?? "monthly",
          monthlyDay: sched?.monthly?.day ?? 10,

          q1Month: sched?.quarterly?.q1Month ?? 4,
          q1Day: sched?.quarterly?.q1Day ?? 30,
          q2Month: sched?.quarterly?.q2Month ?? 7,
          q2Day: sched?.quarterly?.q2Day ?? 31,
          q3Month: sched?.quarterly?.q3Month ?? 10,
          q3Day: sched?.quarterly?.q3Day ?? 31,
          q4Month: sched?.quarterly?.q4Month ?? 1,
          q4Day: sched?.quarterly?.q4Day ?? 31,

          h1Month: sched?.halfYearly?.firstHalf?.month ?? 4,
          h1Day: sched?.halfYearly?.firstHalf?.day ?? 30,
          h2Month: sched?.halfYearly?.secondHalf?.month ?? 10,
          h2Day: sched?.halfYearly?.secondHalf?.day ?? 31,

          yearlyMonth: sched?.yearly?.month ?? 7,
          yearlyDay: sched?.yearly?.day ?? 31,

          oneTimeDueDate: sched?.oneTime?.dueDate
            ? new Date(sched.oneTime.dueDate).toISOString().slice(0, 10)
            : "",

          targetOffsetDays: def.targetOffsetDays ?? 0,
          isActive: def.isActive ?? true,
          autoCreateTasks: def.autoCreateTasks ?? false,
          autoCreateReminders: def.autoCreateReminders ?? false,
        });
      },
      {
        errorMessage: "Failed to load task rule details",
        showErrorToast: false,
      }
    );
  }, [open, mode, definitionId, businessId]);

  const handleClose = () => {
    if (saveAction.loading) return;
    fetchAction.reset();
    saveAction.reset();
    setHeaderTitle("");
    onClose();
  };

  const handleSubmit = async (values: TaskDefinitionFormValues) => {
    const trimmedName = values.name.trim();
    const trimmedDesc = values.description?.trim();

    const dto: CreateTaskDefinitionDto & UpdateTaskDefinitionDto = {
      name: trimmedName,
      taskType: values.taskType,
      description: trimmedDesc || undefined,
      category: values.category || undefined,
      subjectType: values.subjectType,
      priority: values.priority,
      isActive: values.isActive,
      autoCreateTasks: values.autoCreateTasks,
      autoCreateReminders: values.autoCreateReminders,
      titleTemplate: trimmedName,
      descriptionTemplate: trimmedDesc || trimmedName,
      scheduleRule: buildScheduleRule(values),
      targetOffsetDays: Number(values.targetOffsetDays) || 0,
      generationRule: { applyTo: "all_subjects_of_type" },
      metadataTemplate: {},
    };

    await saveAction.run(
      async () => {
        if (mode === "edit" && definitionId) {
          await updateTaskDefinition(businessId, definitionId, dto);
        } else {
          await createTaskDefinition(businessId, dto);
        }
      },
      {
        successMessage:
          mode === "edit"
            ? "Task rule updated successfully"
            : "Task rule created successfully",
        errorMessage:
          mode === "edit"
            ? "Failed to update task rule"
            : "Failed to create task rule",
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: () => {
          onSuccess?.();
          handleClose();
        },
      }
    );
  };

  const currentDefaultValues =
    mode === "edit" && initialFormValues
      ? initialFormValues
      : DEFAULT_FORM_VALUES;

  const formKey =
    mode === "edit"
      ? `edit-${definitionId}-${initialFormValues ? "loaded" : "pending"}`
      : "create";

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={mode === "edit" ? headerTitle || "Edit Rule" : "Create Rule"}
      width="lg"
      customHeader={
        <div className="bg-[#0F1E36] px-6 py-5 flex items-center justify-between text-white shrink-0 border-b border-white/10 select-none">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-slate-950 font-bold shadow-sm shrink-0">
              {mode === "edit" ? (
                <Pencil className="h-5 w-5 text-slate-950 stroke-[2.5]" />
              ) : (
                <Plus className="h-5 w-5 text-slate-950 stroke-[2.5]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-0.5">
                {mode === "edit" ? "Update task rule" : "New task rule"}
              </p>
              <h2 className="text-lg font-extrabold leading-tight text-white tracking-tight truncate">
                {mode === "edit"
                  ? headerTitle || "Update Task Rule"
                  : "Create New Rule"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saveAction.loading}
            aria-label="Close"
            className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      }
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={saveAction.loading}
            className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-semibold text-txt-main bg-[var(--bg)] transition-all hover:bg-[var(--border)]/60 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={TASK_DEFINITION_FORM_ID}
            disabled={saveAction.loading || fetchAction.loading}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 shadow-md transition-all hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {saveAction.loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{mode === "edit" ? "Saving..." : "Creating..."}</span>
              </>
            ) : (
              <span>{mode === "edit" ? "Save changes" : "Create rule"}</span>
            )}
          </button>
        </div>
      }
    >
      <div className="py-1 space-y-4">
        {/* Loading Indicator */}
        {fetchAction.loading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Loading rule details...</span>
          </div>
        )}

        {/* Error Banner */}
        {(saveAction.error || fetchAction.error) && (
          <div
            role="alert"
            className="alert alert-error rounded-xl py-3 px-4 text-xs flex gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">
              {saveAction.error || fetchAction.error}
            </span>
            <button
              type="button"
              onClick={() => {
                saveAction.clearError();
                fetchAction.clearError();
              }}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <FormWrapper
          key={formKey}
          formId={TASK_DEFINITION_FORM_ID}
          schema={taskDefinitionSchema}
          defaultValues={currentDefaultValues}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <TaskDefinitionFormContent onTitleCalculated={setHeaderTitle} />
        </FormWrapper>
      </div>
    </Drawer>
  );
}
