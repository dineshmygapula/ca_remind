'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  Send,
  Loader2,
  AlertCircle,
  Building2,
  Layers,
  MessageSquare,
  Mail,
  Smartphone,
  Eye,
  CheckCircle2,
  Check,
  X,
  Pencil,
  Plus,
  ChevronDown,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import {
  CreateReminderPayload,
  CreateReminderFormState,
  DEFAULT_REMINDER_FORM,
  ReminderChannel,
  ReminderStatus,
} from '@/types/reminders.types';
import {
  createReminder,
  getReminderById,
  updateReminder,
} from '@/services/reminderService';
import { getSubjects } from '@/services/subjectService';
import { getTaskDefinitions } from '@/services/taskDefinitionService';
import { getTasks, createTask } from '@/services/taskService';
import { getV2ReminderDefinitions } from '@/services/reminderDefinitionService';
import { getMessageTemplates } from '@/services/messageTemplateService';
import { getBusinesses } from '@/services/businessService';
import { SubjectListItem } from '@/types/subject';
import { TaskDefinitionListItem } from '@/types/taskDefinition.types';
import { TaskListItem, CreateTaskDto } from '@/types/task.types';
import { V2ReminderDefinition } from '@/types/v2ReminderDefinition.types';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
import { replaceTemplatePlaceholders } from '@/utils/templatePlaceholders';
import { useToast } from '@/context/ToastContext';
import SearchableSelect from '@/components/common/SearchableSelect';

interface ReminderFormDrawerProps {
  open: boolean;
  onClose: () => void;
  reminderId?: string | null;
  businessId: string;
  organizationId: string;
  onSuccess: () => void;
}

const CHANNELS: {
  value: ReminderChannel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'SMS', label: 'SMS', icon: Smartphone },
];

const STATUS_OPTIONS: { value: ReminderStatus; label: string }[] = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'SENT', label: 'Sent' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const INPUT =
  'w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 ' +
  'text-sm font-medium text-txt-main placeholder:text-txt-sub/60 ' +
  'focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all';

const SELECT =
  'w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 ' +
  'text-sm font-medium text-txt-main appearance-none cursor-pointer ' +
  'focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all';

export default function ReminderFormDrawer({
  open,
  onClose,
  reminderId,
  businessId,
  organizationId,
  onSuccess,
}: ReminderFormDrawerProps) {
  const toast = useToast();
  const isEditMode = Boolean(reminderId);

  // ── Form State ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<CreateReminderFormState>(DEFAULT_REMINDER_FORM);
  const [editStatus, setEditStatus] = useState<ReminderStatus>('SCHEDULED');
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [editReminderTaskTitle, setEditReminderTaskTitle] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(false);

  // ── Master Data for Create Mode ─────────────────────────────────────────────
  const [clients, setClients] = useState<SubjectListItem[]>([]);
  const [taskDefinitions, setTaskDefinitions] = useState<TaskDefinitionListItem[]>([]);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [reminderDefinitions, setReminderDefinitions] = useState<V2ReminderDefinition[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplateListItem[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');

  // ── Load Data ───────────────────────────────────────────────────────────────
  const fetchMasterData = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoadingInitial(true);
      setError('');

      const [
        clientsRes,
        taskDefsRes,
        tasksRes,
        reminderDefsRes,
        templatesRes,
        businessesRes,
      ] = await Promise.allSettled([
        getSubjects(businessId),
        getTaskDefinitions(businessId),
        getTasks(businessId),
        getV2ReminderDefinitions(businessId),
        getMessageTemplates(businessId),
        getBusinesses(organizationId),
      ]);

      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value || []);
      if (taskDefsRes.status === 'fulfilled') setTaskDefinitions(taskDefsRes.value || []);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value || []);
      if (reminderDefsRes.status === 'fulfilled')
        setReminderDefinitions(reminderDefsRes.value || []);
      if (templatesRes.status === 'fulfilled') setMessageTemplates(templatesRes.value || []);

      if (businessesRes.status === 'fulfilled' && businessesRes.value?.length) {
        const currentBiz =
          businessesRes.value.find((b) => b.id === businessId) || businessesRes.value[0];
        setBusinessName(currentBiz.name || '');
        setBusinessPhone(currentBiz.phone || '');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load form dependencies.');
    } finally {
      setLoadingInitial(false);
    }
  }, [businessId, organizationId]);

  // Load single reminder when editing
  const fetchSingleReminder = useCallback(async () => {
    if (!reminderId || !businessId) return;
    try {
      setLoadingInitial(true);
      setError('');
      const rem = await getReminderById(businessId, reminderId);
      setEditStatus(rem.status);
      setEditReminderTaskTitle(rem.task?.title || 'Reminder Details');

      if (rem.scheduledAt) {
        const d = new Date(rem.scheduledAt);
        const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setEditScheduledAt(isoLocal);
      } else {
        setEditScheduledAt('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load reminder.');
    } finally {
      setLoadingInitial(false);
    }
  }, [reminderId, businessId]);

  useEffect(() => {
    if (open) {
      if (isEditMode) {
        fetchSingleReminder();
      } else {
        setForm(DEFAULT_REMINDER_FORM);
        fetchMasterData();
      }
    } else {
      setError('');
      setSaving(false);
    }
  }, [open, isEditMode, fetchSingleReminder, fetchMasterData]);

  // ── Client selection logic ──────────────────────────────────────────────────
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === form.targetUserId) || null,
    [clients, form.targetUserId]
  );

  const handleClientChange = (client: SubjectListItem | null) => {
    setForm((prev) => ({
      ...prev,
      targetUserId: client ? client.id : '',
      selectedTaskId: '',
      selectedTaskDefinitionId: '',
      taskName: '',
      dueDate: '',
      messageTemplateId: '',
    }));
  };

  // ── Task Definition selection logic ─────────────────────────────────────────
  const selectedTaskDef = useMemo(
    () => taskDefinitions.find((td) => td.id === form.selectedTaskDefinitionId) || null,
    [taskDefinitions, form.selectedTaskDefinitionId]
  );

  const handleTaskTypeChange = (taskDefinitionId: string) => {
    const matchedDef = taskDefinitions.find((td) => td.id === taskDefinitionId);
    if (!matchedDef) return;

    let autoTaskName = matchedDef.name;
    if (selectedClient) {
      autoTaskName = `${selectedClient.displayName} - ${matchedDef.name}`;
    }

    let nextDueDate = '';
    if (matchedDef.dueDate) {
      nextDueDate = matchedDef.dueDate.slice(0, 10);
    } else {
      const today = new Date();
      today.setDate(today.getDate() + 7);
      nextDueDate = today.toISOString().slice(0, 10);
    }

    setForm((prev) => ({
      ...prev,
      selectedTaskDefinitionId: taskDefinitionId,
      taskName: autoTaskName,
      dueDate: nextDueDate,
      category: (matchedDef as any).category || 'COMPLIANCE',
    }));
  };

  // Template Auto-matching
  useEffect(() => {
    if (!form.selectedTaskDefinitionId || messageTemplates.length === 0) return;
    const def = taskDefinitions.find((td) => td.id === form.selectedTaskDefinitionId);
    if (!def) return;

    const matchedTemplate = messageTemplates.find(
      (t) =>
        t.name?.toLowerCase().includes(def.taskType?.toLowerCase() || '') ||
        t.name?.toLowerCase().includes(def.name?.toLowerCase() || '')
    );

    if (matchedTemplate && !form.messageTemplateId) {
      setForm((prev) => ({ ...prev, messageTemplateId: matchedTemplate.id }));
    }
  }, [form.selectedTaskDefinitionId, messageTemplates, taskDefinitions, form.messageTemplateId]);

  // Live message preview calculation
  const selectedTemplate = useMemo(
    () => messageTemplates.find((t) => t.id === form.messageTemplateId) || null,
    [messageTemplates, form.messageTemplateId]
  );

  const previewBody = useMemo(() => {
    if (!selectedTemplate) return '';
    const rawBody =
      selectedTemplate.templates?.email?.body ||
      selectedTemplate.templates?.whatsapp?.body ||
      selectedTemplate.templates?.sms?.body ||
      (selectedTemplate as any).body ||
      '';

    if (!rawBody) return '';

    const placeholderValues: Record<string, string> = {
      CLIENTNAME: selectedClient?.displayName || 'Client',
      BUSINESSNAME: selectedClient?.businessName || '',
      DUEDATE: form.scheduledAt
        ? new Date(form.scheduledAt).toLocaleDateString('en-IN')
        : 'Due Date',
      SERVICETYPE: selectedTaskDef?.name || 'Compliance',
      YOURFIRMNAME: businessName || 'Our Firm',
      YOURCONTACTNUMBER: businessPhone || '',
    };
    return replaceTemplatePlaceholders(rawBody, placeholderValues);
  }, [selectedTemplate, selectedClient, selectedTaskDef, form.scheduledAt, businessName, businessPhone]);

  // ── Validation & Submission ─────────────────────────────────────────────────
  const validateCreate = (): string | null => {
    if (!form.targetUserId) return 'Please select a client.';
    if (!form.selectedTaskDefinitionId) return 'Please select a task definition.';
    if (!form.taskName.trim()) return 'Please enter a task name.';
    if (!form.channel) return 'Please select a delivery channel.';
    if (!form.sendNow && !form.scheduledAt)
      return 'Please specify a scheduled date and time.';
    return null;
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');

      if (isEditMode) {
        if (!reminderId) return;
        await updateReminder(businessId, reminderId, {
          status: editStatus,
          scheduledAt: editScheduledAt ? new Date(editScheduledAt).toISOString() : undefined,
        });
        toast.success('Reminder updated successfully');
        onSuccess();
        onClose();
      } else {
        const valErr = validateCreate();
        if (valErr) {
          setError(valErr);
          setSaving(false);
          return;
        }

        let resolvedTaskId = (form as any).selectedTaskId || form.taskId;
        if (!resolvedTaskId && form.selectedTaskDefinitionId) {
          const newTaskDto: CreateTaskDto = {
            subjectId: form.targetUserId,
            taskDefinitionId: form.selectedTaskDefinitionId,
            title: form.taskName.trim(),
            taskName: form.taskName.trim(),
            dueDate: (form as any).dueDate || new Date().toISOString().slice(0, 10),
            category: (form as any).category || 'COMPLIANCE',
            priority: 'MEDIUM',
          };
          const createdTask = await createTask(businessId, newTaskDto);
          resolvedTaskId = createdTask.id;
        }

        const payload: CreateReminderPayload = {
          taskId: resolvedTaskId,
          reminderDefinitionId: form.reminderDefinitionId,
          reminderSource: form.reminderSource || 'MANUAL',
          channel: form.channel as ReminderChannel,
          targetUserId: form.targetUserId,
          messageTemplateId: form.messageTemplateId,
          sendNow: form.sendNow,
          ...(!form.sendNow &&
            form.scheduledAt && {
              scheduledAt: new Date(form.scheduledAt).toISOString(),
            }),
        };

        await createReminder(businessId, payload);
        toast.success('Reminder created successfully');
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEditMode ? editReminderTaskTitle || 'Edit Reminder' : 'Create Reminder'}
      width="lg"
      customHeader={
        <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-slate-900 shadow-sm shrink-0">
              {isEditMode ? (
                <Pencil className="h-5 w-5 text-slate-900" />
              ) : (
                <Plus className="h-5 w-5 text-slate-900" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider mb-0.5">
                {isEditMode ? 'Update Reminder' : 'New Reminder'}
              </p>
              <h2 className="text-lg font-bold leading-tight text-white truncate">
                {isEditMode
                  ? editReminderTaskTitle || 'Edit Reminder'
                  : 'Create Reminder'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
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
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-divider py-2.5 px-6 text-sm font-semibold text-txt-main bg-surface transition-colors hover:bg-bg cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || loadingInitial}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
            ) : (
              <Check className="h-4 w-4 text-slate-900" />
            )}
            <span>{isEditMode ? 'Save changes' : 'Create reminder'}</span>
          </button>
        </div>
      }
    >
      {loadingInitial ? (
        <div className="flex flex-col items-center justify-center py-20 text-txt-sub">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B] mb-2" />
          <span className="text-sm font-medium">Loading reminder data...</span>
        </div>
      ) : (
        <div className="space-y-5 py-2">
          {error && (
            <div role="alert" className="alert alert-error flex items-center gap-2 text-sm rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isEditMode ? (
            /* ──────────────── EDIT MODE ──────────────── */
            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-bold text-txt-main">
                  Reminder Configuration
                </h3>
              </div>

              {/* Status select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-txt-main">Status</label>
                <div className="relative">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ReminderStatus)}
                    className={`${SELECT} pr-8`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-surface">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </div>

              {/* Scheduled At datetime */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-txt-main">
                  Scheduled Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={editScheduledAt}
                  onChange={(e) => setEditScheduledAt(e.target.value)}
                  className={INPUT}
                />
                <p className="text-[11px] text-txt-sub">
                  Adjust when this reminder is queued to dispatch.
                </p>
              </div>
            </div>
          ) : (
            /* ──────────────── CREATE MODE ──────────────── */
            <div className="space-y-5">
              {/* Step 1: Client Selection */}
              <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-base font-bold text-txt-main">Select Client *</h3>
                </div>

                <SearchableSelect<SubjectListItem>
                  options={clients}
                  value={selectedClient}
                  onChange={handleClientChange}
                  getOptionLabel={(c) =>
                    `${c.displayName} ${c.businessName ? `(${c.businessName})` : ''}`
                  }
                  getOptionKey={(c) => c.id}
                  placeholder="Search and select client..."
                  emptyMessage="No active clients found"
                />
              </div>

              {/* Step 2: Task Details */}
              <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base font-bold text-txt-main">
                    Task &amp; Compliance *
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-txt-main">
                      Task Definition *
                    </label>
                    <div className="relative">
                      <select
                        value={form.selectedTaskDefinitionId}
                        onChange={(e) => handleTaskTypeChange(e.target.value)}
                        disabled={!form.targetUserId}
                        className={`${SELECT} pr-8 disabled:opacity-50`}
                      >
                        <option value="">Select task definition...</option>
                        {taskDefinitions.map((td) => (
                          <option key={td.id} value={td.id} className="bg-surface">
                            {td.name} ({td.taskType})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-txt-main">
                      Task Name *
                    </label>
                    <input
                      type="text"
                      value={form.taskName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, taskName: e.target.value }))
                      }
                      disabled={!form.selectedTaskDefinitionId}
                      placeholder="e.g. GST Filing for October"
                      className={`${INPUT} disabled:opacity-50`}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Channel Selection */}
              <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-base font-bold text-txt-main">
                    Delivery Channel *
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {CHANNELS.map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = form.channel === ch.value;
                    return (
                      <button
                        type="button"
                        key={ch.value}
                        onClick={() => setForm((p) => ({ ...p, channel: ch.value }))}
                        className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0F1E36] dark:bg-navy text-white border-transparent shadow-xs'
                            : 'border-divider bg-bg/50 text-txt-main hover:bg-bg'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isSelected ? 'text-[#F59E0B]' : 'text-txt-sub'
                          }`}
                        />
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Message Template & Preview */}
              <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-base font-bold text-txt-main">
                      Message Template
                    </h3>
                  </div>
                  {selectedTemplate?.channels?.length ? (
                    <span className="text-xs text-txt-sub">
                      {selectedTemplate.channels.join(', ')}
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <select
                    value={form.messageTemplateId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, messageTemplateId: e.target.value }))
                    }
                    className={`${SELECT} pr-8`}
                  >
                    <option value="">Select template (or use auto-matched)...</option>
                    {messageTemplates.map((t) => (
                      <option key={t.id} value={t.id} className="bg-surface">
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>

                {previewBody && (
                  <div className="mt-3 rounded-xl bg-bg/50 border border-divider p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-txt-main">
                      <Eye className="h-3.5 w-3.5 text-[#F59E0B]" />
                      <span>Live Message Preview</span>
                    </div>
                    <p className="text-xs text-txt-sub whitespace-pre-wrap leading-relaxed font-sans">
                      {previewBody}
                    </p>
                  </div>
                )}
              </div>

              {/* Step 5: Schedule Timing */}
              <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    5
                  </span>
                  <h3 className="text-base font-bold text-txt-main">
                    Dispatch Timing *
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dispatchOption"
                      checked={form.sendNow}
                      onChange={() => setForm((p) => ({ ...p, sendNow: true }))}
                      className="radio radio-primary radio-sm"
                    />
                    <span className="text-xs font-bold text-txt-main">
                      Send Immediately
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dispatchOption"
                      checked={!form.sendNow}
                      onChange={() => setForm((p) => ({ ...p, sendNow: false }))}
                      className="radio radio-primary radio-sm"
                    />
                    <span className="text-xs font-bold text-txt-main">
                      Schedule for Later
                    </span>
                  </label>
                </div>

                {!form.sendNow && (
                  <div className="mt-3 pt-3 border-t border-divider flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-txt-main">
                      Scheduled Date &amp; Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, scheduledAt: e.target.value }))
                      }
                      className={INPUT}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
