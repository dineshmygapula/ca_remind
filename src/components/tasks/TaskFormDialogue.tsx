"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Plus, Pencil, AlertCircle, X, Loader2 } from "lucide-react";
import Drawer from "@/components/common/Drawer";
import { FormWrapper } from "@/components/wrappers/FormWrapper";
import { useAsyncAction } from "@/hooks/useAnyAction";
import { createTask, updateTask, getTaskById } from "@/services/taskService";
import { SubjectListItem } from "@/types/subject";
import { StaffMember } from "@/types/staff.types";
import { MessageTemplateListItem } from "@/types/messageTemplate.types";
import {
  DeliveryChannel,
  TaskPriority,
  CreateTaskDto,
  UpdateTaskDto,
} from "@/types/task.types";
import { useTaskFormData } from "@/hooks/tasks/useTasksFormData";
import { taskFormSchema, TaskFormValues } from "@/utils/schema";

import TaskClientSection from "./task-form/TaskClientSection";
import TaskDetailsSection from "./task-form/TaskDetailsSection";
import TaskRemindersSection from "./task-form/TaskRemindersSection";

interface Props {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess?: () => void;
  taskId?: string;
}

const TASK_FORM_ID = "task-form";

const DEFAULT_FORM_VALUES: TaskFormValues = {
  subjectId: "",
  taskDefinitionId: "",
  taskType: "",
  priority: "MEDIUM",
  frequency: "one_time",
  dueDate: "",
  assignedStaffId: "",
  notes: "",
  remindersEnabled: true,
  templateId: "",
  deliveryChannel: "EMAIL",
  daysBeforeDueDate: 1,
};

function computeTitle(type?: string, date?: string) {
  if (!type) return "";
  if (!date) return type;
  const d = new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
  return `${type} – ${d}`;
}

function formatFrequency(frequency?: string): string {
  if (!frequency) return "ONETIME";
  const upper = frequency.toUpperCase();
  if (upper === "ONE_TIME" || upper === "ONETIME") return "ONETIME";
  if (upper === "HALF_YEARLY" || upper === "HALFYEARLY") return "HALF_YEARLY";
  return upper;
}

function TaskFormContent({
  clients,
  clientsLoading,
  selectedClient,
  setSelectedClient,
  staff,
  staffLoading,
  selectedStaff,
  setSelectedStaff,
  templates,
  templatesLoading,
  selectedTemplate,
  setSelectedTemplate,
  taskDefinitions,
  business,
  onTitleCalculated,
}: {
  clients: SubjectListItem[];
  clientsLoading: boolean;
  selectedClient: SubjectListItem | null;
  setSelectedClient: (client: SubjectListItem | null) => void;
  staff: StaffMember[];
  staffLoading: boolean;
  selectedStaff: StaffMember | null;
  setSelectedStaff: (staff: StaffMember | null) => void;
  templates: MessageTemplateListItem[];
  templatesLoading: boolean;
  selectedTemplate: MessageTemplateListItem | null;
  setSelectedTemplate: (tpl: MessageTemplateListItem | null) => void;
  taskDefinitions: any[];
  business: any;
  onTitleCalculated: (title: string) => void;
}) {
  const { watch } = useFormContext<TaskFormValues>();
  const watchedTaskType = watch("taskType");
  const watchedDueDate = watch("dueDate");

  const calculatedTitle = useMemo(
    () => computeTitle(watchedTaskType, watchedDueDate),
    [watchedTaskType, watchedDueDate],
  );

  useEffect(() => {
    onTitleCalculated(calculatedTitle);
  }, [calculatedTitle, onTitleCalculated]);

  return (
    <div className="space-y-4">
      <TaskClientSection
        clients={clients}
        clientsLoading={clientsLoading}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
      />

      <TaskDetailsSection
        staff={staff}
        staffLoading={staffLoading}
        selectedStaff={selectedStaff}
        onSelectStaff={setSelectedStaff}
        taskDefinitions={taskDefinitions}
        templates={templates}
        onAutoSelectTemplate={setSelectedTemplate}
        generatedTitle={calculatedTitle}
      />

      <TaskRemindersSection
        templates={templates}
        templatesLoading={templatesLoading}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        selectedClient={selectedClient}
        business={business}
      />
    </div>
  );
}

export default function TaskFormDialog({
  open,
  onClose,
  businessId,
  onSuccess,
  taskId,
}: Props) {
  const mode: "create" | "edit" = taskId ? "edit" : "create";

  const [initialFormValues, setInitialFormValues] = useState<
    TaskFormValues | undefined
  >(undefined);
  const [headerTitle, setHeaderTitle] = useState("");

  const [selectedClient, setSelectedClient] = useState<SubjectListItem | null>(
    null,
  );
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MessageTemplateListItem | null>(null);

  // Reusable actions from useAnyAction
  const saveAction = useAsyncAction();
  const fetchTaskAction = useAsyncAction();

  const {
    clients,
    clientsLoading,
    staff,
    staffLoading,
    templates,
    templatesLoading,
    taskDefinitions,
    business,
    error: fetchError,
    setError: setFetchError,
  } = useTaskFormData(businessId, open);

  // ── Edit Mode: fetch task details directly without complex mappers ─────────
  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      setInitialFormValues(undefined);
      setSelectedClient(null);
      setSelectedStaff(null);
      setSelectedTemplate(null);
      setHeaderTitle("");
      return;
    }
    if (!taskId) return;

    fetchTaskAction.run(
      async () => {
        const task = await getTaskById(businessId, taskId);
        const firstReminder =
          (task.reminders?.upcoming?.[0] as any) ??
          (task as any).remindersScheduled?.[0];

        setInitialFormValues({
          ...DEFAULT_FORM_VALUES,
          subjectId: task.subject?.id || (task as any).subjectId || "",
          taskDefinitionId: (task as any).taskDefinitionId || "",
          taskType: task.taskType || "",
          priority: ((task as any).priority || "MEDIUM") as TaskPriority,
          frequency: task.frequency || "one_time",
          dueDate: task.dueDate || task.dates?.dueDate?.slice(0, 10) || "",
          assignedStaffId:
            task.assignee?.id || (task as any).assignedStaffId || "",
          notes: task.notes || (task as any).description || "",
          remindersEnabled: Boolean(firstReminder),
          templateId:
            firstReminder?.messageTemplateId || firstReminder?.templateId || "",
          deliveryChannel: (
            firstReminder?.channel ||
            firstReminder?.deliveryChannel ||
            "EMAIL"
          ).toUpperCase() as DeliveryChannel,
          daysBeforeDueDate: firstReminder?.daysBeforeDueDate || 1,
        });

        if (task.subject) {
          setSelectedClient({
            id: task.subject.id,
            displayName: task.subject.name,
            businessName:
              (task.subject as any).businessName || task.subject.name,
          } as SubjectListItem);
        }
        if (task.assignee) {
          setSelectedStaff({
            id: task.assignee.id,
            firstName: task.assignee.name.split(" ")[0] ?? "",
            lastName: task.assignee.name.split(" ").slice(1).join(" "),
          } as StaffMember);
        }
      },
      {
        errorMessage: "Failed to load task details",
        showErrorToast: false,
      },
    );
  }, [open, mode, taskId, businessId]);

  const handleClose = () => {
    if (saveAction.loading) return;
    setSelectedClient(null);
    setSelectedStaff(null);
    setSelectedTemplate(null);
    fetchTaskAction.reset();
    saveAction.reset();
    setFetchError("");
    onClose();
  };

  const handleSubmit = async (data: TaskFormValues) => {
    const title = computeTitle(data.taskType, data.dueDate);

    // Compute period dates from dueDate
    let periodLabel = "";
    let periodStart = "";
    let periodEnd = "";

    if (data.dueDate) {
      const d = new Date(data.dueDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = d.getMonth();
        periodLabel = d.toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });
        periodStart = new Date(year, month, 1).toISOString();
        periodEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
      }
    }

    const matchedDef = taskDefinitions.find(
      (def) =>
        String(def.taskType).trim().toUpperCase() ===
        data.taskType.trim().toUpperCase(),
    );

    await saveAction.run(
      async () => {
        if (mode === "edit" && taskId) {
          // Backend UPDATE only accepts these 7 fields — send nothing else.
          const updateDto: UpdateTaskDto = {
            description: data.notes?.trim() || undefined,
            notes: data.notes?.trim() || undefined,
            status: "OPEN",
            priority: data.priority,
            dueDate: data.dueDate || undefined,
            assignedStaffId: data.assignedStaffId?.trim() || undefined,
          };
          await updateTask(businessId, taskId, updateDto);
        } else {
          // CREATE accepts the exact required payload.
          const createDto: CreateTaskDto = {
            title,
            taskName: title,
            subjectId: data.subjectId,
            dueDate: data.dueDate,
            description: data.notes?.trim() || "",
            notes: data.notes?.trim() || "",
            taskType: data.taskType,
            frequency: formatFrequency(data.frequency),
            periodLabel,
            taskDefinitionId: data.taskDefinitionId || matchedDef?.id || "",
            periodStart,
            periodEnd,
            category: matchedDef?.category || "COMPLIANCE",
            priority: data.priority || "MEDIUM",
            assignedStaffId: data.assignedStaffId?.trim() || "",
            status: "OPEN",
            metadata: {},
            remindersScheduled:
              data.remindersEnabled && data.templateId
                ? [
                    {
                      deliveryChannel: data.deliveryChannel,
                      daysBeforeDueDate: Number(data.daysBeforeDueDate) || 0,
                      messageTemplateId: data.templateId,
                    },
                  ]
                : [],
          };
          await createTask(businessId, createDto);
        }
      },
      {
        successMessage:
          mode === "edit"
            ? "Task updated successfully"
            : "Task created successfully",
        errorMessage:
          mode === "edit" ? "Failed to update task" : "Failed to create task",
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: () => {
          onSuccess?.();
          handleClose();
        },
      },
    );
  };

  const currentDefaultValues =
    mode === "edit" && initialFormValues
      ? initialFormValues
      : DEFAULT_FORM_VALUES;

  const formKey =
    mode === "edit"
      ? `edit-${taskId}-${initialFormValues ? "loaded" : "pending"}`
      : "create";

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={mode === "edit" ? headerTitle || "Edit Task" : "Create Task"}
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
                {mode === "edit" ? "Update task" : "New task"}
              </p>
              <h2 className="text-lg font-extrabold leading-tight text-white tracking-tight truncate">
                {mode === "edit"
                  ? headerTitle || "Update Task Details"
                  : "Create New Task"}
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
            form={TASK_FORM_ID}
            disabled={saveAction.loading || fetchTaskAction.loading}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 shadow-md transition-all hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {saveAction.loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{mode === "edit" ? "Saving..." : "Creating..."}</span>
              </>
            ) : (
              <span>{mode === "edit" ? "Save changes" : "Create task"}</span>
            )}
          </button>
        </div>
      }
    >
      <div className="py-1">
        {/* Loading Indicator */}
        {fetchTaskAction.loading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs mb-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Loading task details...</span>
          </div>
        )}

        <FormWrapper
          key={formKey}
          formId={TASK_FORM_ID}
          schema={taskFormSchema}
          defaultValues={currentDefaultValues}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <TaskFormContent
            clients={clients}
            clientsLoading={clientsLoading}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            staff={staff}
            staffLoading={staffLoading}
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
            templates={templates}
            templatesLoading={templatesLoading}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            taskDefinitions={taskDefinitions}
            business={business}
            onTitleCalculated={setHeaderTitle}
          />
        </FormWrapper>
      </div>
    </Drawer>
  );
}
