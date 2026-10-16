'use client';

import { useState, useEffect } from 'react';
import {
  Pencil,
  Plus,
  AlertCircle,
  X,
  ChevronDown,
  Loader2,
  Check,
  Settings,
  Zap,
  Bell,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import {
  getTaskDefinitionById,
  updateTaskDefinition,
  createTaskDefinition,
} from '@/services/taskDefinitionService';
import {
  TaskDefinition,
  CreateTaskDefinitionDto,
  UpdateTaskDefinitionDto,
  ScheduleRule,
  TaskPriority,
  SchedulePattern,
} from '@/types/taskDefinition.types';
import {
  SCHEDULE_PATTERNS,
  SUBJECT_TYPE_OPTIONS,
  TASK_CATEGORIES,
  TASK_TYPES,
  MONTHS,
  DAYS,
} from '@/constants/taskDefinition.constants';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TaskDefinitionFormDrawerProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  definitionId?: string | null;
  onSuccess?: () => void;
}

// ─── Form Data Shape ──────────────────────────────────────────────────────────

interface FormData {
  name: string;
  taskType: string;
  description: string;
  category: string;
  subjectType: string;
  priority: TaskPriority;

  schedulePattern: SchedulePattern;
  monthlyDay: number;
  q1Month: number;
  q1Day: number;
  q2Month: number;
  q2Day: number;
  q3Month: number;
  q3Day: number;
  q4Month: number;
  q4Day: number;
  h1Month: number;
  h1Day: number;
  h2Month: number;
  h2Day: number;
  yearlyMonth: number;
  yearlyDay: number;
  oneTimeDueDate: string;

  targetOffsetDays: number;
  isActive: boolean;
  autoCreateTasks: boolean;
  autoCreateReminders: boolean;
}

const DEFAULT_FORM: FormData = {
  name: '',
  taskType: '',
  description: '',
  category: '',
  subjectType: 'CLIENT',
  priority: 'MEDIUM',
  schedulePattern: 'monthly',
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
  oneTimeDueDate: '',
  targetOffsetDays: 0,
  isActive: true,
  autoCreateTasks: true,
  autoCreateReminders: true,
};

export default function TaskDefinitionFormDrawer({
  open,
  onClose,
  businessId,
  definitionId,
  onSuccess,
}: TaskDefinitionFormDrawerProps) {
  const mode: 'create' | 'edit' = definitionId ? 'edit' : 'create';

  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // ── Fetch & Pre-fill when editing ───────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    if (mode === 'create') {
      setForm(DEFAULT_FORM);
      setError('');
      return;
    }

    if (!definitionId || !businessId) return;

    (async () => {
      setFetching(true);
      setError('');
      try {
        const def: TaskDefinition = await getTaskDefinitionById(businessId, definitionId);
        const sched = def.scheduleRule;

        setForm({
          name: def.name ?? '',
          taskType: def.taskType ?? '',
          description: def.description ?? '',
          category: def.category ?? '',
          subjectType: def.subjectType ?? 'CLIENT',
          priority: def.priority ?? 'MEDIUM',

          schedulePattern: sched?.pattern ?? 'monthly',
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
            : '',

          targetOffsetDays: def.targetOffsetDays ?? 0,
          isActive: def.isActive,
          autoCreateTasks: def.autoCreateTasks ?? false,
          autoCreateReminders: def.autoCreateReminders ?? false,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load task definition');
      } finally {
        setFetching(false);
      }
    })();
  }, [open, mode, definitionId, businessId]);

  const set = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Rule name is required';
    if (!form.taskType.trim()) return 'Task type is required';
    if (!form.subjectType) return 'Applies to is required';
    if (form.schedulePattern === 'one_time' && !form.oneTimeDueDate)
      return 'Due date is required for one-time tasks';
    return null;
  };

  const buildScheduleRule = (): ScheduleRule => {
    const rule: ScheduleRule = { pattern: form.schedulePattern };
    switch (form.schedulePattern) {
      case 'monthly':
        rule.monthly = { day: form.monthlyDay };
        break;
      case 'quarterly':
        rule.quarterly = {
          q1Month: form.q1Month,
          q1Day: form.q1Day,
          q2Month: form.q2Month,
          q2Day: form.q2Day,
          q3Month: form.q3Month,
          q3Day: form.q3Day,
          q4Month: form.q4Month,
          q4Day: form.q4Day,
        };
        break;
      case 'half_yearly':
        rule.halfYearly = {
          firstHalf: { month: form.h1Month, day: form.h1Day },
          secondHalf: { month: form.h2Month, day: form.h2Day },
        };
        break;
      case 'yearly':
        rule.yearly = { month: form.yearlyMonth, day: form.yearlyDay };
        break;
      case 'one_time':
        rule.oneTime = { dueDate: form.oneTimeDueDate };
        break;
    }
    return rule;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (mode === 'edit' && definitionId) {
        const dto: UpdateTaskDefinitionDto = {
          name: form.name.trim(),
          taskType: form.taskType,
          description: form.description.trim() || undefined,
          category: form.category || undefined,
          subjectType: form.subjectType,
          priority: form.priority,
          isActive: form.isActive,
          autoCreateTasks: form.autoCreateTasks,
          autoCreateReminders: form.autoCreateReminders,
          titleTemplate: form.name.trim(),
          descriptionTemplate: form.description.trim() || form.name.trim(),
          scheduleRule: buildScheduleRule(),
          targetOffsetDays: form.targetOffsetDays,
          generationRule: { applyTo: 'all_subjects_of_type' },
          metadataTemplate: {},
        };
        await updateTaskDefinition(businessId, definitionId, dto);
      } else {
        const createDto: CreateTaskDefinitionDto = {
          name: form.name.trim(),
          taskType: form.taskType,
          description: form.description.trim() || undefined,
          category: form.category || undefined,
          subjectType: form.subjectType,
          priority: form.priority,
          isActive: form.isActive,
          autoCreateTasks: form.autoCreateTasks,
          autoCreateReminders: form.autoCreateReminders,
          titleTemplate: form.name.trim(),
          descriptionTemplate: form.description.trim() || form.name.trim(),
          scheduleRule: buildScheduleRule(),
          targetOffsetDays: form.targetOffsetDays,
          generationRule: { applyTo: 'all_subjects_of_type' },
          metadataTemplate: {},
        };
        await createTaskDefinition(businessId, createDto);
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} task definition`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setError('');
    onClose();
  };

  const repeatsTabs: { label: string; value: SchedulePattern }[] = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={mode === 'edit' ? form.name || 'Edit rule' : 'New rule'}
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
                {mode === 'edit' ? 'Edit rule' : 'New rule'}
              </p>
              <h2 className="text-lg font-bold leading-tight text-white truncate">
                {mode === 'edit' ? form.name || 'Edit rule' : 'Create new rule'}
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
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
            ) : (
              <Check className="h-4 w-4 text-slate-900" />
            )}
            <span>{mode === 'edit' ? 'Save changes' : 'Create rule'}</span>
          </button>
        </div>
      }
    >
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
          <p className="text-sm font-semibold text-txt-main">Loading rule details...</p>
          <p className="text-xs text-txt-sub">Please wait while we retrieve the rule configuration.</p>
        </div>
      ) : (
        <div className="space-y-5 py-2">
          {/* Error Banner */}
          {error && (
            <div role="alert" className="alert alert-error rounded-xl py-3 px-4 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1 font-medium">{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── Section 1: Basics ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-txt-main">Basics</h3>
            </div>

            {/* Rule name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-txt-main">
                Rule name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. ROC_ANNUAL123"
                className="w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 text-sm font-medium text-txt-main placeholder:text-txt-sub/60 focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
            </div>

            {/* Task type & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-txt-main">
                  Task type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.taskType}
                    onChange={(e) => set('taskType', e.target.value)}
                    className="w-full h-11 appearance-none rounded-xl border border-divider bg-bg/50 pl-3.5 pr-8 text-sm font-medium text-txt-main focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select task type</option>
                    {TASK_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-surface">
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-txt-main">Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    className="w-full h-11 appearance-none rounded-xl border border-divider bg-bg/50 pl-3.5 pr-8 text-sm font-medium text-txt-main focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {TASK_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-surface">
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </div>
            </div>

            {/* Applies to & Priority Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-txt-main">
                  Applies to <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.subjectType}
                    onChange={(e) => set('subjectType', e.target.value)}
                    className="w-full h-11 appearance-none rounded-xl border border-divider bg-bg/50 pl-3.5 pr-8 text-sm font-medium text-txt-main focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
                  >
                    {SUBJECT_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-surface">
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </div>

              {/* Priority as a DROPDOWN per user's explicit request */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-txt-main">Priority</label>
                <div className="relative">
                  <select
                    value={form.priority}
                    onChange={(e) => set('priority', e.target.value as TaskPriority)}
                    className="w-full h-11 appearance-none rounded-xl border border-divider bg-bg/50 pl-3.5 pr-8 text-sm font-medium text-txt-main focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
                  >
                    <option value="LOW" className="bg-surface">● Low</option>
                    <option value="MEDIUM" className="bg-surface">● Medium</option>
                    <option value="HIGH" className="bg-surface">● High</option>
                    <option value="URGENT" className="bg-surface">● Urgent</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-txt-main">Description</label>
                <span className="text-xs text-txt-sub">{form.description.length} / 240</span>
              </div>
              <textarea
                rows={3}
                maxLength={240}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the compliance rule or add notes"
                className="w-full rounded-xl border border-divider bg-bg/50 p-3 text-sm font-medium text-txt-main placeholder:text-txt-sub/60 focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
              />
            </div>
          </div>

          {/* ── Section 2: Schedule ───────────────────────────────────── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-bold text-txt-main">Schedule</h3>
            </div>

            {/* Repeats Segmented Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-txt-main">
                Repeats <span className="text-red-500">*</span>
              </label>
              <div className="bg-bg p-1 rounded-xl border border-divider/50 flex items-center gap-1">
                {repeatsTabs.map((tab) => {
                  const isSelected = form.schedulePattern === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => set('schedulePattern', tab.value)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F1E36] dark:bg-navy text-white font-semibold shadow-xs'
                          : 'text-txt-sub hover:text-txt-main'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frequency details */}
            {form.schedulePattern === 'monthly' && (
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-semibold text-txt-main">
                  Day of Month (due day)
                </label>
                <div className="relative">
                  <select
                    value={form.monthlyDay}
                    onChange={(e) => set('monthlyDay', Number(e.target.value))}
                    className="w-full h-11 appearance-none rounded-xl border border-divider bg-bg/50 pl-3.5 pr-8 text-sm font-medium text-txt-main focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all cursor-pointer"
                  >
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value} className="bg-surface">
                        Day {d.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </div>
            )}

            {form.schedulePattern === 'quarterly' && (
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Q1 (Apr – Jun)', mField: 'q1Month' as const, dField: 'q1Day' as const },
                  { label: 'Q2 (Jul – Sep)', mField: 'q2Month' as const, dField: 'q2Day' as const },
                  { label: 'Q3 (Oct – Dec)', mField: 'q3Month' as const, dField: 'q3Day' as const },
                  { label: 'Q4 (Jan – Mar)', mField: 'q4Month' as const, dField: 'q4Day' as const },
                ].map(({ label, mField, dField }) => (
                  <div key={label} className="p-3 rounded-xl border border-divider bg-bg/40 space-y-2">
                    <p className="text-xs font-bold text-txt-main">{label}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-txt-sub">Month</label>
                        <select
                          value={form[mField]}
                          onChange={(e) => set(mField, Number(e.target.value))}
                          className="w-full h-10 rounded-lg border border-divider bg-surface px-2.5 text-xs text-txt-main"
                        >
                          {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-txt-sub">Day</label>
                        <select
                          value={form[dField]}
                          onChange={(e) => set(dField, Number(e.target.value))}
                          className="w-full h-10 rounded-lg border border-divider bg-surface px-2.5 text-xs text-txt-main"
                        >
                          {DAYS.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {form.schedulePattern === 'yearly' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-txt-main">Due Month</label>
                  <select
                    value={form.yearlyMonth}
                    onChange={(e) => set('yearlyMonth', Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 text-sm text-txt-main"
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-txt-main">Due Day</label>
                  <select
                    value={form.yearlyDay}
                    onChange={(e) => set('yearlyDay', Number(e.target.value))}
                    className="w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 text-sm text-txt-main"
                  >
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>
                        Day {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Target offset days */}
            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-semibold text-txt-main">
                Target Offset Days (days before due date)
              </label>
              <input
                type="number"
                min={-365}
                max={365}
                value={form.targetOffsetDays}
                onChange={(e) => set('targetOffsetDays', Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 text-sm font-medium text-txt-main focus:bg-surface focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* ── Section 3: Automation & Status ────────────────────────── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-bold text-txt-main">Automation &amp; Status</h3>
            </div>

            <div className="divide-y divide-divider">
              {/* Active */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${form.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-txt-main">Rule Status</p>
                    <p className="text-[11px] text-txt-sub">Enable or disable this task rule</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => set('isActive', !form.isActive)}
                >
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                      form.isActive ? 'bg-[#1e293b]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                        form.isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${form.isActive ? 'text-[#059669]' : 'text-txt-sub'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Auto Tasks */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${form.autoCreateTasks ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-txt-main">Auto-create Tasks</p>
                    <p className="text-[11px] text-txt-sub">Automatically generate task instances on due dates</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => set('autoCreateTasks', !form.autoCreateTasks)}
                >
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                      form.autoCreateTasks ? 'bg-[#1e293b]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                        form.autoCreateTasks ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${form.autoCreateTasks ? 'text-txt-main' : 'text-txt-sub'}`}>
                    {form.autoCreateTasks ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              {/* Auto Reminders */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${form.autoCreateReminders ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-txt-main">Auto-create Reminders</p>
                    <p className="text-[11px] text-txt-sub">Automatically schedule client notifications</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => set('autoCreateReminders', !form.autoCreateReminders)}
                >
                  <div
                    className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                      form.autoCreateReminders ? 'bg-[#1e293b]' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                        form.autoCreateReminders ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${form.autoCreateReminders ? 'text-txt-main' : 'text-txt-sub'}`}>
                    {form.autoCreateReminders ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
