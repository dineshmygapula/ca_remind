'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  ChevronDown,
  AlertCircle,
  X,
  Bell,
  Calendar,
  AlignLeft,
  Tag,
  Repeat,
  Mail,
  Sparkles,
  User2,
  Loader2,
  Check,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import SearchableSelect from '@/components/common/SearchableSelect';

import { createTask, updateTask, getTaskById } from '@/services/taskService';
import { SubjectListItem } from '@/types/subject';
import { StaffMember } from '@/types/staff.types';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
import { TaskPriority } from '@/types/task.types';
import { TASK_TYPES, FREQUENCY_OPTIONS, DELIVERY_CHANNELS } from '@/constants/taskConstants';
import { useTaskFormData } from '@/hooks/tasks/useTasksFormData';
import { TaskFormData, useTaskForm } from '@/hooks/tasks/useTaskForm';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess?: () => void;
  taskId?: string;
}

// ─── Field primitives ─────────────────────────────────────────────────────────

const INPUT =
  'w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 ' +
  'text-sm font-medium text-txt-main placeholder:text-txt-sub/60 ' +
  'focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all';

const TEXTAREA =
  'w-full rounded-xl border border-divider bg-bg/50 p-3 ' +
  'text-sm font-medium text-txt-main placeholder:text-txt-sub/60 resize-none ' +
  'focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all';

const SELECT =
  'w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 ' +
  'text-sm font-medium text-txt-main appearance-none cursor-pointer ' +
  'focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all';

// ─── FieldWrap ────────────────────────────────────────────────────────────────

function FieldWrap({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-txt-main">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      </div>
      {helper && (
        <p className="text-[11px] text-txt-sub leading-snug -mt-0.5">{helper}</p>
      )}
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskFormDialog({
  open,
  onClose,
  businessId,
  onSuccess,
  taskId,
}: Props) {
  const mode: 'create' | 'edit' = taskId ? 'edit' : 'create';

  const [submitting, setSubmitting] = useState(false);
  const [error, setLocalError] = useState('');
  const [loadingTask, setLoadingTask] = useState(false);
  const [initialForm, setInitialForm] = useState<TaskFormData | undefined>(undefined);

  const [selectedClient, setSelectedClient] = useState<SubjectListItem | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateListItem | null>(null);

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

  const {
    form,
    set,
    setReminder,
    generatedTaskTitle,
    getValidDaysBeforeOptions,
    replaceTemplatePlaceholders,
    validate,
    toDto,
    reset,
  } = useTaskForm({ initialForm, templates, taskDefinitions, selectedClient, business });

  // ── Edit: fetch task ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      setInitialForm(undefined);
      setSelectedClient(null);
      setSelectedStaff(null);
      setSelectedTemplate(null);
      return;
    }
    if (!taskId) return;

    (async () => {
      try {
        setLoadingTask(true);
        setLocalError('');
        const task = await getTaskById(businessId, taskId);
        const firstReminder =
          (task.reminders?.upcoming?.[0] as any) ?? (task as any).remindersScheduled?.[0];
        const hasReminders =
          (task.reminders?.upcoming?.length ?? 0) > 0 ||
          Boolean((task as any).remindersScheduled?.length);

        const rawTaskType = task.taskType ?? '';
        const matchedType = TASK_TYPES.find(
          (t) =>
            t.value === rawTaskType ||
            t.apiValue === rawTaskType ||
            t.label.toUpperCase() === rawTaskType.toUpperCase()
        );
        const resolvedTaskType = matchedType ? matchedType.value : rawTaskType;

        const rawFrequency = (task.frequency ?? '').toLowerCase();
        const matchedFreq = FREQUENCY_OPTIONS.find(
          (f) =>
            f.value.toLowerCase() === rawFrequency ||
            f.value.replace('_', '').toLowerCase() === rawFrequency.replace('_', '').toLowerCase()
        );
        const resolvedFrequency = matchedFreq ? matchedFreq.value : 'one_time';

        const rawDueDate = task.dates?.dueDate ?? task.dueDate ?? '';
        const resolvedDueDate = rawDueDate ? rawDueDate.slice(0, 10) : '';
        const resolvedAssigneeId =
          task.assignee?.id ?? (task as any).assignedStaffId ?? '';
        const resolvedSubjectId = task.subject?.id ?? (task as any).subjectId ?? '';
        const resolvedTemplateId =
          firstReminder?.messageTemplateId ?? firstReminder?.templateId ?? '';

        setInitialForm({
          subjectId: resolvedSubjectId,
          taskDefinitionId: (task as any).taskDefinitionId ?? '',
          taskType: resolvedTaskType,
          taskPriority:
            (task as any).priority ?? (task as any).taskPriority ?? 'MEDIUM',
          frequency: resolvedFrequency,
          dueDate: resolvedDueDate,
          assignedStaffId: resolvedAssigneeId,
          templateId: resolvedTemplateId,
          notes: task.notes ?? (task as any).description ?? '',
          remindersEnabled: hasReminders,
          reminder: {
            deliveryChannel:
              ((firstReminder?.channel ??
                (firstReminder as any)?.deliveryChannel ??
                'EMAIL').toUpperCase() as import('@/types/task.types').DeliveryChannel),
            daysBeforeDueDate: firstReminder?.daysBeforeDueDate ?? 1,
          },
        });

        if (task.subject) {
          setSelectedClient({
            id: task.subject.id,
            displayName: task.subject.name,
            businessName: (task.subject as any).businessName || task.subject.name,
          } as SubjectListItem);
        }
        if (task.assignee) {
          setSelectedStaff({
            id: task.assignee.id,
            firstName: task.assignee.name.split(' ')[0] ?? '',
            lastName: task.assignee.name.split(' ').slice(1).join(' '),
          } as StaffMember);
        }
      } catch (err: unknown) {
        setLocalError(err instanceof Error ? err.message : 'Failed to load task details');
      } finally {
        setLoadingTask(false);
      }
    })();
  }, [open, mode, taskId, businessId]);

  // Keep selectedTemplate in sync with form.templateId
  useEffect(() => {
    if (!form.templateId || templates.length === 0) return;
    const found = templates.find((t) => t.id === form.templateId);
    if (found) setSelectedTemplate(found);
  }, [form.templateId, templates]);

  const handleClose = () => {
    if (submitting) return;
    reset();
    setSelectedClient(null);
    setSelectedStaff(null);
    setSelectedTemplate(null);
    setLocalError('');
    setFetchError('');
    onClose();
  };

  const combinedError = error || fetchError;

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setSubmitting(true);
    setLocalError('');

    try {
      const dto = toDto();
      if (mode === 'edit' && taskId) {
        await updateTask(businessId, taskId, dto);
      } else {
        await createTask(businessId, dto);
      }
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : `Failed to ${mode} task`);
    } finally {
      setSubmitting(false);
    }
  };

  const validDaysBeforeOptions = getValidDaysBeforeOptions(form.dueDate);

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={mode === 'edit' ? generatedTaskTitle || 'Edit Task' : 'Create Task'}
      width="lg"
      customHeader={
        <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-slate-900 shadow-sm shrink-0">
              {mode === 'edit' ? (
                <Pencil className="h-5 w-5 text-slate-900" />
              ) : (
                <Plus className="h-5 w-5 text-slate-900" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider mb-0.5">
                {mode === 'edit' ? 'Edit Task' : 'New Task'}
              </p>
              <h2 className="text-lg font-bold leading-tight text-white truncate">
                {mode === 'edit'
                  ? generatedTaskTitle || 'Update Task Details'
                  : 'Create New Task'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl border border-divider py-2.5 px-6 text-sm font-semibold text-txt-main bg-surface transition-colors hover:bg-bg cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || loadingTask}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
            ) : (
              <Check className="h-4 w-4 text-slate-900" />
            )}
            <span>{mode === 'edit' ? 'Save changes' : 'Create task'}</span>
          </button>
        </div>
      }
    >
      {loadingTask ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
          <p className="text-sm font-semibold text-txt-main">Loading task details...</p>
          <p className="text-xs text-txt-sub">
            Please wait while we retrieve the task information.
          </p>
        </div>
      ) : (
        <div className="space-y-5 py-2">
          {/* ── Error banner ─────────────────────────────────────────────── */}
          {combinedError && (
            <div role="alert" className="alert alert-error rounded-xl py-3 px-4 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1 font-medium">{combinedError}</span>
              <button
                type="button"
                onClick={() => {
                  setLocalError('');
                  setFetchError('');
                }}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── Section 1: Client ────────────────────────────────────────── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-txt-main">Client</h3>
            </div>

            <FieldWrap label="Select Client" required>
              <SearchableSelect
                options={clients}
                value={selectedClient}
                onChange={(client) => {
                  setSelectedClient(client);
                  set('subjectId', client?.id ?? '');
                }}
                getOptionLabel={(c) => c.displayName}
                getOptionKey={(c) => c.id}
                loading={clientsLoading}
                placeholder="Search and select client..."
                emptyMessage={
                  clients.length === 0
                    ? 'No clients found. Create a client first.'
                    : 'No matching clients'
                }
              />
            </FieldWrap>
          </div>

          {/* ── Section 2: Task Details ──────────────────────────────────── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-bold text-txt-main">Task Details</h3>
            </div>

            {/* Task Type & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrap label="Task Type" required>
                <div className="relative">
                  <select
                    value={form.taskType}
                    onChange={(e) => set('taskType', e.target.value)}
                    className={`${SELECT} pr-8`}
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    {TASK_TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="bg-surface">
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </FieldWrap>

              <FieldWrap label="Frequency" required>
                <div className="relative">
                  <select
                    value={form.frequency}
                    onChange={(e) => set('frequency', e.target.value)}
                    className={`${SELECT} pr-8`}
                  >
                    {FREQUENCY_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value} className="bg-surface">
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </FieldWrap>
            </div>

            {/* Due Date & Priority Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrap label="Due Date" required>
                <div className="relative">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => {
                      const d = e.target.value;
                      set('dueDate', d);
                      const opts = getValidDaysBeforeOptions(d);
                      if (
                        !opts.some((o) => o.value === form.reminder.daysBeforeDueDate) &&
                        opts.length > 0
                      ) {
                        setReminder('daysBeforeDueDate', opts[0].value);
                      }
                    }}
                    className={INPUT}
                  />
                </div>
              </FieldWrap>

              {/* Priority as a dropdown */}
              <FieldWrap label="Priority">
                <div className="relative">
                  <select
                    value={form.taskPriority}
                    onChange={(e) => set('taskPriority', e.target.value as TaskPriority)}
                    className={`${SELECT} pr-8`}
                  >
                    <option value="LOW" className="bg-surface">● Low</option>
                    <option value="MEDIUM" className="bg-surface">● Medium</option>
                    <option value="HIGH" className="bg-surface">● High</option>
                    <option value="URGENT" className="bg-surface">● Urgent</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </FieldWrap>
            </div>

            {/* Task Title */}
            <FieldWrap label="Task Title">
              <input
                readOnly
                value={generatedTaskTitle}
                placeholder="Auto-generated based on client & type"
                className={`${INPUT} cursor-default bg-bg/70 ${
                  generatedTaskTitle ? 'text-txt-main' : 'text-txt-sub/50'
                }`}
              />
            </FieldWrap>

            {/* Assigned To */}
            <FieldWrap label="Assigned To">
              <SearchableSelect
                options={staff}
                value={selectedStaff}
                onChange={(member) => {
                  setSelectedStaff(member);
                  set('assignedStaffId', member?.id ?? '');
                }}
                getOptionLabel={(m) =>
                  [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email || m.id
                }
                getOptionKey={(m) => m.id}
                loading={staffLoading}
                placeholder="Search and select employee..."
                emptyMessage={
                  staff.length === 0
                    ? 'No staff found. Add a staff member first.'
                    : 'No matching staff'
                }
              />
            </FieldWrap>

            {/* Notes */}
            <FieldWrap label="Notes">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Add any relevant notes or instructions..."
                className={TEXTAREA}
              />
            </FieldWrap>
          </div>

          {/* ── Section 3: Reminders ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base font-bold text-txt-main">Reminders</h3>
              </div>

              {/* Styled toggle switch matching task definitions */}
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => set('remindersEnabled', !form.remindersEnabled)}
              >
                <div
                  className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                    form.remindersEnabled ? 'bg-[#0F1E36] dark:bg-navy' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                      form.remindersEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-semibold ${
                    form.remindersEnabled ? 'text-txt-main' : 'text-txt-sub'
                  }`}
                >
                  {form.remindersEnabled ? 'On' : 'Off'}
                </span>
              </div>
            </div>

            {form.remindersEnabled && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldWrap label="Delivery Channel" helper="Primary channel">
                    <div className="relative">
                      <select
                        value={form.reminder.deliveryChannel}
                        onChange={(e) =>
                          setReminder('deliveryChannel', e.target.value as never)
                        }
                        className={`${SELECT} pr-8`}
                      >
                        {DELIVERY_CHANNELS.map((ch) => (
                          <option key={ch.value} value={ch.value} className="bg-surface">
                            {ch.icon} {ch.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                    </div>
                  </FieldWrap>

                  <FieldWrap
                    label="Days Before Due"
                    helper={form.dueDate ? 'Days ahead to send' : 'Pick a due date first'}
                  >
                    <div className="relative">
                      <select
                        value={form.reminder.daysBeforeDueDate}
                        onChange={(e) =>
                          setReminder('daysBeforeDueDate', Number(e.target.value))
                        }
                        disabled={!form.dueDate}
                        className={`${SELECT} pr-8 disabled:opacity-50`}
                      >
                        {validDaysBeforeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-surface">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                    </div>
                  </FieldWrap>
                </div>

                {/* Template */}
                <FieldWrap
                  label="Message Template"
                  required
                  helper="Matched to task type & channel"
                >
                  <SearchableSelect
                    options={templates}
                    value={selectedTemplate}
                    onChange={(template) => {
                      setSelectedTemplate(template);
                      set('templateId', template?.id ?? '');
                    }}
                    getOptionLabel={(t) => t.name}
                    getOptionKey={(t) => t.id}
                    loading={templatesLoading}
                    placeholder="Search and select template..."
                    emptyMessage={
                      templates.length === 0
                        ? 'No templates found. Create a template first.'
                        : 'No matching templates'
                    }
                    renderOption={(t) => (
                      <div>
                        <p className="font-semibold text-txt-main">{t.name}</p>
                        <p className="text-xs text-txt-sub">
                          {t.businessCategory}
                          {t.channels?.length ? ` · ${t.channels.join(', ')}` : ''}
                        </p>
                      </div>
                    )}
                  />

                  {/* Template preview card */}
                  {selectedTemplate && (
                    <div className="mt-3 rounded-xl border border-divider bg-bg/50 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <p className="text-xs font-bold text-txt-main">
                          Template Preview
                        </p>
                      </div>
                      <div className="text-xs text-txt-sub leading-relaxed">
                        {form.reminder.deliveryChannel === 'EMAIL' &&
                        selectedTemplate.templates?.email ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-txt-main">
                              {replaceTemplatePlaceholders(
                                selectedTemplate.templates.email.subject
                              )}
                            </p>
                            <p className="whitespace-pre-line text-txt-sub">
                              {replaceTemplatePlaceholders(
                                selectedTemplate.templates.email.body
                              )}
                            </p>
                          </div>
                        ) : form.reminder.deliveryChannel === 'EMAIL' ? (
                          <p className="italic text-txt-sub/60">
                            No Email content in this template
                          </p>
                        ) : null}

                        {form.reminder.deliveryChannel === 'WHATSAPP' &&
                        selectedTemplate.templates?.whatsapp ? (
                          <p className="whitespace-pre-line text-txt-sub">
                            💬{' '}
                            {replaceTemplatePlaceholders(
                              selectedTemplate.templates.whatsapp.body
                            )}
                          </p>
                        ) : form.reminder.deliveryChannel === 'WHATSAPP' ? (
                          <p className="italic text-txt-sub/60">
                            No WhatsApp content in this template
                          </p>
                        ) : null}

                        {form.reminder.deliveryChannel !== 'EMAIL' &&
                          form.reminder.deliveryChannel !== 'WHATSAPP' && (
                            <p className="italic text-txt-sub/60">
                              No preview for {form.reminder.deliveryChannel}
                            </p>
                          )}
                      </div>
                    </div>
                  )}
                </FieldWrap>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
