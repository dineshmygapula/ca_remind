'use client';

import { useEffect, useState } from 'react';
import {
  PlusCircle,
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
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import SearchableSelect from '@/components/common/SearchableSelect';

import { createTask, updateTask, getTaskById } from '@/services/taskService';
import { SubjectListItem } from '@/types/subject';
import { StaffMember } from '@/types/staff.types';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
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
  'w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] ' +
  'text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 ' +
  'outline-none transition-all hover:border-[var(--accent)]/50 ' +
  'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20';

const TEXTAREA =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] ' +
  'text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 resize-none ' +
  'outline-none transition-all hover:border-[var(--accent)]/50 ' +
  'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20';

const SELECT =
  'w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] ' +
  'text-sm font-medium text-[var(--text-primary)] ' +
  'outline-none transition-all hover:border-[var(--accent)]/50 appearance-none ' +
  'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20';

// ─── FieldWrap ────────────────────────────────────────────────────────────────

function FieldWrap({
  label,
  required,
  helper,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-txt-sub">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {required && <span className="text-[var(--accent)] ml-0.5">*</span>}
      </label>
      {helper && (
        <p className="text-[11px] text-txt-sub/70 leading-snug -mt-0.5">{helper}</p>
      )}
      {children}
    </div>
  );
}

// ─── SelectWithIcon ───────────────────────────────────────────────────────────

function SelectWithIcon({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  icon: Icon,
}: {
  value: string | number;
  onChange: (val: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--accent)] pointer-events-none z-10" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${SELECT} ${Icon ? 'pl-9' : 'pl-3'} pr-8 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[var(--surface)]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-sub/60 pointer-events-none" />
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TaskFormDialog({ open, onClose, businessId, onSuccess, taskId }: Props) {
  const mode: 'create' | 'edit' = taskId ? 'edit' : 'create';

  const [submitting, setSubmitting] = useState(false);
  const [error, setLocalError] = useState('');
  const [loadingTask, setLoadingTask] = useState(false);
  const [initialForm, setInitialForm] = useState<TaskFormData | undefined>(undefined);

  const [selectedClient, setSelectedClient] = useState<SubjectListItem | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateListItem | null>(null);

  const {
    clients, clientsLoading,
    staff, staffLoading,
    templates, templatesLoading,
    taskDefinitions, business,
    error: fetchError,
    setError: setFetchError,
  } = useTaskFormData(businessId, open);

  const {
    form, set, setReminder,
    generatedTaskTitle,
    getValidDaysBeforeOptions,
    replaceTemplatePlaceholders,
    validate, toDto, reset,
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
        const firstReminder = task.reminders?.upcoming?.[0] ?? (task as any).remindersScheduled?.[0];
        const hasReminders = ((task.reminders?.upcoming?.length ?? 0) > 0) || Boolean((task as any).remindersScheduled?.length);

        // Match taskType with TASK_TYPES
        const rawTaskType = task.taskType ?? '';
        const matchedType = TASK_TYPES.find(
          (t) =>
            t.value === rawTaskType ||
            t.apiValue === rawTaskType ||
            t.label.toUpperCase() === rawTaskType.toUpperCase()
        );
        const resolvedTaskType = matchedType ? matchedType.value : rawTaskType;

        // Match frequency with FREQUENCY_OPTIONS
        const rawFrequency = (task.frequency ?? '').toLowerCase();
        const matchedFreq = FREQUENCY_OPTIONS.find(
          (f) =>
            f.value.toLowerCase() === rawFrequency ||
            f.value.replace('_', '').toLowerCase() === rawFrequency.replace('_', '').toLowerCase()
        );
        const resolvedFrequency = matchedFreq ? matchedFreq.value : 'one_time';

        const rawDueDate = task.dates?.dueDate ?? task.dueDate ?? '';
        const resolvedDueDate = rawDueDate ? rawDueDate.slice(0, 10) : '';
        const resolvedAssigneeId = task.assignee?.id ?? (task as any).assignedStaffId ?? '';
        const resolvedSubjectId = task.subject?.id ?? (task as any).subjectId ?? '';
        const resolvedTemplateId = firstReminder?.messageTemplateId ?? (firstReminder as any)?.templateId ?? '';

        setInitialForm({
          subjectId: resolvedSubjectId,
          taskDefinitionId: (task as any).taskDefinitionId ?? '',
          taskType: resolvedTaskType,
          taskPriority: (task as any).priority ?? (task as any).taskPriority ?? 'MEDIUM',
          frequency: resolvedFrequency,
          dueDate: resolvedDueDate,
          assignedStaffId: resolvedAssigneeId,
          templateId: resolvedTemplateId,
          notes: task.notes ?? (task as any).description ?? '',
          remindersEnabled: hasReminders,
          reminder: {
            deliveryChannel: ((firstReminder?.channel ?? (firstReminder as any)?.deliveryChannel ?? 'EMAIL').toUpperCase() as import('@/types/task.types').DeliveryChannel),
            daysBeforeDueDate: firstReminder?.daysBeforeDueDate ?? 1,
          },
        });

        // Prefill client/staff immediately from task if available
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
            firstName: task.assignee.name,
            lastName: '',
            email: '',
          } as StaffMember);
        }
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to load task');
      } finally {
        setLoadingTask(false);
      }
    })();
  }, [open, mode, taskId, businessId]);

  // ── Prefill selects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialForm) return;
    if (initialForm.subjectId && clients.length) {
      const found = clients.find((c) => c.id === initialForm.subjectId);
      if (found) setSelectedClient(found);
    }
    if (initialForm.assignedStaffId && staff.length) {
      const found = staff.find((s) => s.id === initialForm.assignedStaffId);
      if (found) setSelectedStaff(found);
    }
    if (initialForm.templateId && templates.length) {
      const found = templates.find((t) => t.id === initialForm.templateId);
      if (found) setSelectedTemplate(found);
    }
  }, [initialForm, clients, staff, templates]);

  const combinedError = error || fetchError;

  const handleClose = () => {
    if (submitting) return;
    setLocalError(''); setFetchError('');
    setSelectedClient(null); setSelectedStaff(null); setSelectedTemplate(null);
    reset(); onClose();
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setLocalError(validationError); return; }
    setSubmitting(true); setLocalError('');
    try {
      const dto = toDto();
      if (mode === 'edit' && taskId) await updateTask(businessId, taskId, dto);
      else await createTask(businessId, dto);
      handleClose(); onSuccess?.();
    } catch (err) {
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
      icon={mode === 'edit' ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
      eyebrow={mode === 'edit' ? 'Edit Task' : 'New Task'}
      title={mode === 'edit' ? 'Update Task Details' : 'Create New Task'}
      onCancel={handleClose}
      onSubmit={handleSubmit}
      submitLabel={mode === 'edit' ? 'Update Task' : 'Save Task'}
      submitting={submitting || loadingTask}
      submitVariant="success"
      width="md"
    >
      {loadingTask ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm font-semibold text-txt-main">Loading task details...</p>
          <p className="text-xs text-txt-sub">Please wait while we retrieve the task information.</p>
        </div>
      ) : (
      <div className="space-y-4">

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {combinedError && (
          <div role="alert" className="alert alert-error rounded-xl py-3 px-4 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1 font-medium">{combinedError}</span>
            <button
              type="button"
              onClick={() => { setLocalError(''); setFetchError(''); }}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Client ───────────────────────────────────────────────────── */}
        <SectionCard>
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
              Client
            </p>
          </div>
          <div className="px-4 py-3">
            <FieldWrap label="Select Client" required icon={User2}>
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
        </SectionCard>

        {/* ── Task Details ─────────────────────────────────────────────── */}
        <SectionCard>
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
              Task Details
            </p>
          </div>
          <div className="px-4 py-4 grid grid-cols-2 gap-4">
            <FieldWrap label="Task Type" required icon={Tag}>
              <SelectWithIcon
                value={form.taskType}
                onChange={(val) => set('taskType', val)}
                options={TASK_TYPES}
                placeholder="Select type"
                icon={Tag}
              />
            </FieldWrap>

            <FieldWrap label="Frequency" required icon={Repeat}>
              <SelectWithIcon
                value={form.frequency}
                onChange={(val) => set('frequency', val)}
                options={FREQUENCY_OPTIONS}
                icon={Repeat}
              />
            </FieldWrap>

            <FieldWrap label="Due Date" required icon={Calendar}>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--accent)] pointer-events-none z-10" />
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => {
                    const d = e.target.value;
                    set('dueDate', d);
                    const opts = getValidDaysBeforeOptions(d);
                    if (!opts.some((o) => o.value === form.reminder.daysBeforeDueDate) && opts.length > 0)
                      setReminder('daysBeforeDueDate', opts[0].value);
                  }}
                  className={`${INPUT} pl-9 pr-3`}
                />
              </div>
            </FieldWrap>

            <FieldWrap label="Task Title" icon={Sparkles}>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--accent)]/60 pointer-events-none z-10" />
                <input
                  readOnly
                  value={generatedTaskTitle}
                  placeholder="Auto-generated"
                  className={`${INPUT} pl-9 pr-3 cursor-default bg-[var(--bg)] ${
                    generatedTaskTitle ? 'text-txt-main' : 'text-txt-sub/50'
                  }`}
                />
              </div>
            </FieldWrap>

            <div className="col-span-2">
              <FieldWrap label="Assigned To" icon={User2}>
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
            </div>

            <div className="col-span-2">
              <FieldWrap label="Notes" icon={AlignLeft}>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 w-3.5 h-3.5 text-[var(--accent)]/60 pointer-events-none z-10" />
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Add any relevant notes..."
                    className={`${TEXTAREA} pl-9 pr-3 py-2.5`}
                  />
                </div>
              </FieldWrap>
            </div>
          </div>
        </SectionCard>

        {/* ── Reminders ────────────────────────────────────────────────── */}
        <SectionCard>
          {/* Toggle header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg)]">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                form.remindersEnabled
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                  : 'bg-[var(--border)]/60 text-txt-sub'
              }`}>
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                  Reminders
                </p>
                <p className="text-[11px] text-txt-sub leading-none mt-0.5">
                  {form.remindersEnabled ? 'Enabled — send before due date' : 'Disabled'}
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className={`text-[11px] font-bold ${form.remindersEnabled ? 'text-[var(--accent)]' : 'text-txt-sub'}`}>
                {form.remindersEnabled ? 'ON' : 'OFF'}
              </span>
              <input
                type="checkbox"
                checked={form.remindersEnabled}
                onChange={(e) => set('remindersEnabled', e.target.checked)}
                className="toggle toggle-sm toggle-warning"
              />
            </label>
          </div>

          {/* Expanded fields */}
          {form.remindersEnabled && (
            <div className="border-t border-[var(--border)] px-4 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldWrap label="Delivery Channel" helper="One channel per task" icon={Mail}>
                  <SelectWithIcon
                    value={form.reminder.deliveryChannel}
                    onChange={(val) => setReminder('deliveryChannel', val as never)}
                    options={DELIVERY_CHANNELS}
                    icon={Mail}
                  />
                </FieldWrap>

                <FieldWrap
                  label="Days Before Due"
                  helper={form.dueDate ? 'Days ahead to send' : 'Pick a due date first'}
                  icon={Calendar}
                >
                  <SelectWithIcon
                    value={form.reminder.daysBeforeDueDate}
                    onChange={(val) => setReminder('daysBeforeDueDate', Number(val))}
                    options={validDaysBeforeOptions}
                    disabled={!form.dueDate}
                    icon={Calendar}
                  />
                </FieldWrap>
              </div>

              {/* Template */}
              <FieldWrap
                label="Message Template"
                required
                helper="Matched to your task type & channel"
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
                  <div className="mt-3 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/8 overflow-hidden">
                    <div className="px-3 py-2 border-b border-[var(--accent)]/15 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                        Template Preview
                      </p>
                    </div>
                    <div className="px-3 py-2.5">
                      {form.reminder.deliveryChannel === 'EMAIL' &&
                        selectedTemplate.templates?.email ? (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-txt-main">
                            {replaceTemplatePlaceholders(selectedTemplate.templates.email.subject)}
                          </p>
                          <p className="whitespace-pre-line text-xs text-txt-sub leading-relaxed">
                            {replaceTemplatePlaceholders(selectedTemplate.templates.email.body)}
                          </p>
                        </div>
                      ) : form.reminder.deliveryChannel === 'EMAIL' ? (
                        <p className="text-xs text-txt-sub/60 italic">No Email content in this template</p>
                      ) : null}

                      {form.reminder.deliveryChannel === 'WHATSAPP' &&
                        selectedTemplate.templates?.whatsapp ? (
                        <p className="whitespace-pre-line text-xs text-txt-sub leading-relaxed">
                          💬 {replaceTemplatePlaceholders(selectedTemplate.templates.whatsapp.body)}
                        </p>
                      ) : form.reminder.deliveryChannel === 'WHATSAPP' ? (
                        <p className="text-xs text-txt-sub/60 italic">No WhatsApp content in this template</p>
                      ) : null}

                      {form.reminder.deliveryChannel !== 'EMAIL' &&
                        form.reminder.deliveryChannel !== 'WHATSAPP' && (
                          <p className="text-xs text-txt-sub/60 italic">
                            No preview for {form.reminder.deliveryChannel}
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </FieldWrap>
            </div>
          )}
        </SectionCard>
      </div>
      )}
    </Drawer>
  );
}

// getTaskById is imported from '@/services/taskService' — no stub needed.
