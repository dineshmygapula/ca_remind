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

const CHANNELS: { value: ReminderChannel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
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
        subjectsData,
        taskDefsData,
        tasksData,
        reminderDefsData,
        messageTemplatesData,
      ] = await Promise.all([
        getSubjects(businessId),
        getTaskDefinitions(businessId),
        getTasks(businessId),
        getV2ReminderDefinitions(businessId),
        getMessageTemplates(businessId),
      ]);

      const activeClients = (subjectsData || []).filter(
        (s) => s.subjectType === 'CLIENT' && s.isActive
      );

      setClients(activeClients);
      setTaskDefinitions(taskDefsData || []);
      setTasks(tasksData || []);
      setReminderDefinitions(reminderDefsData || []);
      setMessageTemplates(messageTemplatesData || []);

      if (organizationId) {
        try {
          const businesses = await getBusinesses(organizationId);
          const currentBiz = businesses.find((b) => b.id === businessId);
          if (currentBiz) {
            setBusinessName(currentBiz.name ?? '');
            setBusinessPhone(currentBiz.phone ?? '');
          }
        } catch {
          // Non-critical
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load master data');
    } finally {
      setLoadingInitial(false);
    }
  }, [businessId, organizationId]);

  // Load existing reminder for Edit mode
  useEffect(() => {
    if (!open || !businessId) return;

    if (isEditMode && reminderId) {
      const loadReminder = async () => {
        try {
          setLoadingInitial(true);
          setError('');
          const data = await getReminderById(businessId, reminderId);
          setEditStatus(data.status);
          setEditScheduledAt(data.scheduledAt ? data.scheduledAt.slice(0, 16) : '');
          setEditReminderTaskTitle(data.task?.title || 'Reminder');
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Failed to load reminder');
        } finally {
          setLoadingInitial(false);
        }
      };
      loadReminder();
    } else {
      // Create mode
      fetchMasterData();
      setForm(DEFAULT_REMINDER_FORM);
      setEditReminderTaskTitle('');
    }
  }, [open, isEditMode, reminderId, businessId, fetchMasterData]);

  // ── Cascading Handlers (Create Mode) ─────────────────────────────────────────
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === form.targetUserId) || null,
    [clients, form.targetUserId]
  );

  const selectedTaskDef = useMemo(
    () => taskDefinitions.find((td) => td.id === form.selectedTaskDefinitionId) || null,
    [taskDefinitions, form.selectedTaskDefinitionId]
  );

  const handleClientChange = (client: SubjectListItem | null) => {
    setForm((prev) => ({
      ...prev,
      targetUserId: client ? client.id : '',
      selectedTaskDefinitionId: '',
      taskId: '',
      taskName: '',
      reminderDefinitionId: '',
      channel: '',
      messageTemplateId: '',
    }));
  };

  const handleTaskTypeChange = (taskDefinitionId: string) => {
    const taskDef = taskDefinitions.find((td) => td.id === taskDefinitionId);
    const foundTask = tasks.find(
      (t) =>
        t.subject?.id === form.targetUserId &&
        t.taskType != null &&
        taskDef?.taskType != null &&
        t.taskType.startsWith(taskDef.taskType)
    );

    const matchedReminderDef = reminderDefinitions.find(
      (rd) => rd.taskDefinitionId === taskDefinitionId
    );

    setForm((prev) => ({
      ...prev,
      selectedTaskDefinitionId: taskDefinitionId,
      taskId: foundTask?.id ?? '',
      taskName: foundTask?.title || (taskDef ? `${taskDef.name} for ${selectedClient?.displayName || 'Client'}` : prev.taskName),
      reminderDefinitionId: matchedReminderDef?.id ?? '',
      channel: (matchedReminderDef?.channel as ReminderChannel) || prev.channel || 'WHATSAPP',
    }));
  };

  // Auto-match message template by Task Definition name
  useEffect(() => {
    if (!form.selectedTaskDefinitionId || messageTemplates.length === 0) return;
    const taskDef = taskDefinitions.find((td) => td.id === form.selectedTaskDefinitionId);
    if (!taskDef?.taskType) return;

    const matched = messageTemplates.find((template) =>
      template.name?.toLowerCase().includes(taskDef.taskType.split('_')[0].toLowerCase())
    );

    if (matched) {
      setForm((prev) => ({
        ...prev,
        messageTemplateId: matched.id,
      }));
    }
  }, [form.selectedTaskDefinitionId, messageTemplates, taskDefinitions]);

  // Live message preview calculation
  const selectedTemplate = useMemo(
    () => messageTemplates.find((t) => t.id === form.messageTemplateId) || null,
    [messageTemplates, form.messageTemplateId]
  );

  const previewBody = useMemo(() => {
    if (!selectedTemplate?.body) return '';
    const placeholderValues: Record<string, string> = {
      CLIENTNAME: selectedClient?.displayName || selectedClient?.name || 'Client',
      BUSINESSNAME: selectedClient?.businessName || '',
      DUEDATE: form.scheduledAt ? new Date(form.scheduledAt).toLocaleDateString('en-IN') : 'Due Date',
      SERVICETYPE: selectedTaskDef?.name || 'Compliance',
      YOURFIRMNAME: businessName || 'Our Firm',
      YOURCONTACTNUMBER: businessPhone || '',
    };
    return replaceTemplatePlaceholders(selectedTemplate.body, placeholderValues);
  }, [selectedTemplate, selectedClient, selectedTaskDef, form.scheduledAt, businessName, businessPhone]);

  // ── Validation & Submission ─────────────────────────────────────────────────
  const validateCreate = (): string | null => {
    if (!form.targetUserId) return 'Please select a client.';
    if (!form.selectedTaskDefinitionId) return 'Please select a task type.';
    if (!form.taskName.trim()) return 'Please enter a task name.';
    if (!form.channel) return 'Please select a delivery channel.';
    if (!form.sendNow && !form.scheduledAt) return 'Please specify a scheduled date and time.';
    return null;
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');

      if (isEditMode) {
        // Edit Mode Submission
        if (!reminderId) return;
        await updateReminder(businessId, reminderId, {
          status: editStatus,
          scheduledAt: editScheduledAt ? new Date(editScheduledAt).toISOString() : undefined,
        });
        toast.success('Reminder updated successfully');
        onSuccess();
        onClose();
      } else {
        // Create Mode Submission
        const validationErr = validateCreate();
        if (validationErr) {
          setError(validationErr);
          setSaving(false);
          return;
        }

        let resolvedTaskId = form.taskId;
        if (!resolvedTaskId) {
          const dueDateIso = form.scheduledAt
            ? new Date(form.scheduledAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          const taskDto: CreateTaskDto = {
            title: form.taskName,
            taskName: form.taskName,
            subjectId: form.targetUserId,
            taskDefinitionId: form.selectedTaskDefinitionId || undefined,
            taskType: selectedTaskDef?.taskType || '',
            dueDate: dueDateIso,
            category: 'COMPLIANCE',
            status: 'OPEN',
            priority: 'MEDIUM',
            frequency: 'ONETIME',
            remindersScheduled: [],
          };

          const newTask = await createTask(businessId, taskDto);
          resolvedTaskId = newTask.id;
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
      eyebrow={isEditMode ? 'Update Reminder' : 'New Reminder'}
      title={isEditMode ? (editReminderTaskTitle || 'Edit Reminder') : 'Create Reminder'}
      width="lg"
      icon={<Bell className="h-4 w-4 text-[var(--accent)]" />}
      onSubmit={handleSubmit}
      onCancel={onClose}
      submitLabel={isEditMode ? 'Save Changes' : 'Create Reminder'}
      submitting={saving}
      submitVariant="primary"
    >
      {loadingInitial ? (
        <div className="flex flex-col items-center justify-center py-20 text-txt-sub">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mb-2" />
          <span className="text-sm">Loading reminder data...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="alert alert-error flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isEditMode ? (
            /* ──────────────── EDIT MODE ──────────────── */
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-sub">
                  Reminder Configuration
                </h3>

                {/* Status select */}
                <div>
                  <label className="block text-xs font-bold text-txt-main mb-1.5">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ReminderStatus)}
                    className="select select-bordered select-sm w-full font-medium"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scheduled At datetime */}
                <div>
                  <label className="block text-xs font-bold text-txt-main mb-1.5">
                    Scheduled Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editScheduledAt}
                    onChange={(e) => setEditScheduledAt(e.target.value)}
                    className="input input-bordered input-sm w-full font-medium"
                  />
                  <p className="mt-1 text-[11px] text-txt-sub">
                    Adjust when this reminder is queued to dispatch.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ──────────────── CREATE MODE ──────────────── */
            <div className="space-y-5">
              {/* Step 1: Client Selection */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-txt-sub">
                  <Building2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>1. Select Client *</span>
                </div>

                <SearchableSelect<SubjectListItem>
                  options={clients}
                  value={selectedClient}
                  onChange={handleClientChange}
                  getOptionLabel={(c) => `${c.displayName || c.name} ${c.businessName ? `(${c.businessName})` : ''}`}
                  getOptionKey={(c) => c.id}
                  placeholder="Search and select client..."
                  emptyMessage="No active clients found"
                />
              </div>

              {/* Step 2: Task Details */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-txt-sub">
                  <Layers className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>2. Task &amp; Compliance *</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-txt-main mb-1">
                      Task Definition *
                    </label>
                    <select
                      value={form.selectedTaskDefinitionId}
                      onChange={(e) => handleTaskTypeChange(e.target.value)}
                      disabled={!form.targetUserId}
                      className="select select-bordered select-sm w-full font-medium"
                    >
                      <option value="">Select task definition...</option>
                      {taskDefinitions.map((td) => (
                        <option key={td.id} value={td.id}>
                          {td.name} ({td.taskType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-txt-main mb-1">
                      Task Name *
                    </label>
                    <input
                      type="text"
                      value={form.taskName}
                      onChange={(e) => setForm((p) => ({ ...p, taskName: e.target.value }))}
                      disabled={!form.selectedTaskDefinitionId}
                      placeholder="e.g. GST Filing for October"
                      className="input input-bordered input-sm w-full font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Channel Selection */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-txt-sub">
                  <Send className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>3. Delivery Channel *</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {CHANNELS.map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = form.channel === ch.value;
                    return (
                      <button
                        type="button"
                        key={ch.value}
                        onClick={() => setForm((p) => ({ ...p, channel: ch.value }))}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-navy bg-navy text-white shadow-sm'
                            : 'border-[var(--border)] bg-[var(--surface-subtle)] text-txt-main hover:bg-[var(--border)]/40'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-[var(--accent)]' : 'text-txt-sub'}`} />
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Message Template & Preview */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-txt-sub">
                    <MessageSquare className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span>4. Message Template</span>
                  </div>
                  {selectedTemplate && (
                    <span className="badge badge-xs badge-ghost text-txt-sub">
                      {selectedTemplate.channel || form.channel}
                    </span>
                  )}
                </div>

                <select
                  value={form.messageTemplateId}
                  onChange={(e) => setForm((p) => ({ ...p, messageTemplateId: e.target.value }))}
                  className="select select-bordered select-sm w-full font-medium"
                >
                  <option value="">Select template (or use matched)...</option>
                  {messageTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                {previewBody && (
                  <div className="mt-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-txt-sub uppercase tracking-wider mb-1.5">
                      <Eye className="h-3 w-3 text-[var(--accent)]" />
                      <span>Live Message Preview</span>
                    </div>
                    <p className="text-xs text-txt-main whitespace-pre-wrap leading-relaxed font-sans">
                      {previewBody}
                    </p>
                  </div>
                )}
              </div>

              {/* Step 5: Schedule Timing */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-txt-sub">
                  <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>5. Dispatch Timing *</span>
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
                    <span className="text-xs font-bold text-txt-main">Send Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dispatchOption"
                      checked={!form.sendNow}
                      onChange={() => setForm((p) => ({ ...p, sendNow: false }))}
                      className="radio radio-primary radio-sm"
                    />
                    <span className="text-xs font-bold text-txt-main">Schedule for Later</span>
                  </label>
                </div>

                {!form.sendNow && (
                  <div className="mt-2 pt-2 border-t border-[var(--border)]/70">
                    <label className="block text-xs font-bold text-txt-main mb-1">
                      Scheduled Date &amp; Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                      className="input input-bordered input-sm w-full font-medium"
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
