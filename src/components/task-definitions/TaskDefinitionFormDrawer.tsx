'use client';

import { useState, useEffect } from 'react';
import {
  Pencil,
  PlusCircle,
  AlertCircle,
  X,
  Calendar,
  Layers,
  Settings,
  ChevronDown,
  Loader2,
  Tag,
  AlignLeft,
  Users,
  Clock,
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
  PRIORITY_OPTIONS,
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
  yearlyMonth: 3,
  yearlyDay: 31,
  oneTimeDueDate: '',
  targetOffsetDays: 0,
  isActive: true,
  autoCreateTasks: false,
  autoCreateReminders: false,
};

// ─── Field Primitives ─────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
        {Icon && <Icon className="w-3 h-3 text-[var(--accent)]" />}
        {label}
        {required && <span className="text-[var(--accent)] ml-0.5">*</span>}
      </label>
      {helper && <p className="text-[11px] text-txt-sub/70 leading-snug -mt-0.5">{helper}</p>}
      {children}
    </div>
  );
}

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
  options: readonly { value: string | number; label: string }[];
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

function SectionCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${className}`}>
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
          {title}
        </p>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
      try {
        setFetching(true);
        setError('');
        const def: TaskDefinition = await getTaskDefinitionById(businessId, definitionId);

        setForm({
          name: def.name,
          taskType: def.taskType,
          description: def.description || '',
          category: def.category || '',
          subjectType: def.subjectType,
          priority: def.priority,
          schedulePattern: def.scheduleRule.pattern,

          // Monthly
          monthlyDay: def.scheduleRule.monthly?.day ?? 10,

          // Quarterly
          q1Month: def.scheduleRule.quarterly?.q1Month ?? 4,
          q1Day: def.scheduleRule.quarterly?.q1Day ?? 30,
          q2Month: def.scheduleRule.quarterly?.q2Month ?? 7,
          q2Day: def.scheduleRule.quarterly?.q2Day ?? 31,
          q3Month: def.scheduleRule.quarterly?.q3Month ?? 10,
          q3Day: def.scheduleRule.quarterly?.q3Day ?? 31,
          q4Month: def.scheduleRule.quarterly?.q4Month ?? 1,
          q4Day: def.scheduleRule.quarterly?.q4Day ?? 31,

          // Half-Yearly
          h1Month: def.scheduleRule.halfYearly?.firstHalf.month ?? 4,
          h1Day: def.scheduleRule.halfYearly?.firstHalf.day ?? 30,
          h2Month: def.scheduleRule.halfYearly?.secondHalf.month ?? 10,
          h2Day: def.scheduleRule.halfYearly?.secondHalf.day ?? 31,

          // Yearly
          yearlyMonth: def.scheduleRule.yearly?.month ?? 3,
          yearlyDay: def.scheduleRule.yearly?.day ?? 31,

          // One-Time
          oneTimeDueDate: def.scheduleRule.oneTime?.dueDate
            ? new Date(def.scheduleRule.oneTime.dueDate).toISOString().split('T')[0]
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
    if (!form.name.trim()) return 'Task name is required';
    if (!form.taskType.trim()) return 'Task type is required';
    if (!form.subjectType) return 'Subject type is required';
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

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      icon={mode === 'edit' ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
      eyebrow={mode === 'edit' ? 'Edit Definition' : 'New Definition'}
      title={mode === 'edit' ? 'Update Task Definition' : 'Create Task Definition'}
      onCancel={handleClose}
      onSubmit={handleSubmit}
      submitLabel={mode === 'edit' ? 'Update Definition' : 'Save Definition'}
      submitting={submitting || fetching}
      submitVariant="success"
      width="lg"
    >
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm font-semibold text-txt-main">Loading definition details...</p>
          <p className="text-xs text-txt-sub">Please wait while we retrieve the rule configuration.</p>
        </div>
      ) : (
        <div className="space-y-4">
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

          {/* ── Section 1: Basic Information ───────────────────────────────── */}
          <SectionCard title="Basic Information">
            <div className="space-y-4">
              <FieldWrap label="Task Name" required icon={Tag}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g., GST-3B Monthly Filing"
                  className={`${INPUT} px-3`}
                />
              </FieldWrap>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrap label="Task Type" required icon={Layers}>
                  <SelectWithIcon
                    value={form.taskType}
                    onChange={(val) => set('taskType', val)}
                    options={TASK_TYPES.map((t) => ({ value: t, label: t }))}
                    placeholder="Select task type"
                    icon={Layers}
                  />
                </FieldWrap>

                <FieldWrap label="Category" icon={Tag}>
                  <SelectWithIcon
                    value={form.category}
                    onChange={(val) => set('category', val)}
                    options={TASK_CATEGORIES.map((c) => ({ value: c, label: c }))}
                    placeholder="Select category"
                    icon={Tag}
                  />
                </FieldWrap>

                <FieldWrap label="Subject Type" required icon={Users}>
                  <SelectWithIcon
                    value={form.subjectType}
                    onChange={(val) => set('subjectType', val)}
                    options={SUBJECT_TYPE_OPTIONS}
                    icon={Users}
                  />
                </FieldWrap>

                <FieldWrap label="Priority" icon={Clock}>
                  <SelectWithIcon
                    value={form.priority}
                    onChange={(val) => set('priority', val as TaskPriority)}
                    options={PRIORITY_OPTIONS}
                    icon={Clock}
                  />
                </FieldWrap>
              </div>

              <FieldWrap label="Description" icon={AlignLeft}>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the compliance rule or notes..."
                  className={`${TEXTAREA} px-3 py-2`}
                />
              </FieldWrap>
            </div>
          </SectionCard>

          {/* ── Section 2: Schedule ────────────────────────────────────────── */}
          <SectionCard title="Schedule Pattern">
            <div className="space-y-4">
              <FieldWrap label="Schedule Frequency" required icon={Calendar}>
                <SelectWithIcon
                  value={form.schedulePattern}
                  onChange={(val) => set('schedulePattern', val as SchedulePattern)}
                  options={SCHEDULE_PATTERNS}
                  icon={Calendar}
                />
              </FieldWrap>

              {/* Monthly */}
              {form.schedulePattern === 'monthly' && (
                <FieldWrap label="Day of Month" helper="Day of each month the task is due" icon={Clock}>
                  <SelectWithIcon
                    value={form.monthlyDay}
                    onChange={(val) => set('monthlyDay', Number(val))}
                    options={DAYS}
                  />
                </FieldWrap>
              )}

              {/* Quarterly */}
              {form.schedulePattern === 'quarterly' && (
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Q1 (Apr – Jun)', mField: 'q1Month' as const, dField: 'q1Day' as const },
                    { label: 'Q2 (Jul – Sep)', mField: 'q2Month' as const, dField: 'q2Day' as const },
                    { label: 'Q3 (Oct – Dec)', mField: 'q3Month' as const, dField: 'q3Day' as const },
                    { label: 'Q4 (Jan – Mar)', mField: 'q4Month' as const, dField: 'q4Day' as const },
                  ].map(({ label, mField, dField }) => (
                    <div key={label} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-2">
                      <p className="text-xs font-bold text-txt-main">{label}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldWrap label="Month">
                          <SelectWithIcon
                            value={form[mField]}
                            onChange={(val) => set(mField, Number(val))}
                            options={MONTHS}
                          />
                        </FieldWrap>
                        <FieldWrap label="Day">
                          <SelectWithIcon
                            value={form[dField]}
                            onChange={(val) => set(dField, Number(val))}
                            options={DAYS}
                          />
                        </FieldWrap>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Half-Yearly */}
              {form.schedulePattern === 'half_yearly' && (
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'First Half', mField: 'h1Month' as const, dField: 'h1Day' as const },
                    { label: 'Second Half', mField: 'h2Month' as const, dField: 'h2Day' as const },
                  ].map(({ label, mField, dField }) => (
                    <div key={label} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-2">
                      <p className="text-xs font-bold text-txt-main">{label}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldWrap label="Month">
                          <SelectWithIcon
                            value={form[mField]}
                            onChange={(val) => set(mField, Number(val))}
                            options={MONTHS}
                          />
                        </FieldWrap>
                        <FieldWrap label="Day">
                          <SelectWithIcon
                            value={form[dField]}
                            onChange={(val) => set(dField, Number(val))}
                            options={DAYS}
                          />
                        </FieldWrap>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Yearly */}
              {form.schedulePattern === 'yearly' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <FieldWrap label="Month">
                    <SelectWithIcon
                      value={form.yearlyMonth}
                      onChange={(val) => set('yearlyMonth', Number(val))}
                      options={MONTHS}
                    />
                  </FieldWrap>
                  <FieldWrap label="Day">
                    <SelectWithIcon
                      value={form.yearlyDay}
                      onChange={(val) => set('yearlyDay', Number(val))}
                      options={DAYS}
                    />
                  </FieldWrap>
                </div>
              )}

              {/* One-Time */}
              {form.schedulePattern === 'one_time' && (
                <FieldWrap label="Due Date" required icon={Calendar}>
                  <input
                    type="date"
                    value={form.oneTimeDueDate}
                    onChange={(e) => set('oneTimeDueDate', e.target.value)}
                    className={`${INPUT} px-3`}
                  />
                </FieldWrap>
              )}

              <FieldWrap
                label="Target Offset Days"
                helper="Days before (−) or after (+) due date to target completion"
                icon={Clock}
              >
                <input
                  type="number"
                  min={-365}
                  max={365}
                  value={form.targetOffsetDays}
                  onChange={(e) => set('targetOffsetDays', Number(e.target.value))}
                  className={`${INPUT} px-3`}
                />
              </FieldWrap>
            </div>
          </SectionCard>

          {/* ── Section 3: Automation & Status ─────────────────────────────── */}
          <SectionCard title="Automation & Status">
            <div className="divide-y divide-[var(--border)]">
              {/* Active */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${form.isActive ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-txt-main">Active Status</p>
                    <p className="text-[11px] text-txt-sub">Enable or disable this task rule</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-[11px] font-bold ${form.isActive ? 'text-emerald-600' : 'text-txt-sub'}`}>
                    {form.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => set('isActive', e.target.checked)}
                    className="toggle toggle-sm toggle-success"
                  />
                </label>
              </div>

              {/* Auto Tasks */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${form.autoCreateTasks ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-slate-200 text-slate-500'}`}>
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-txt-main">Auto-create Tasks</p>
                    <p className="text-[11px] text-txt-sub">Automatically generate task instances on due dates</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-[11px] font-bold ${form.autoCreateTasks ? 'text-[var(--accent)]' : 'text-txt-sub'}`}>
                    {form.autoCreateTasks ? 'ON' : 'OFF'}
                  </span>
                  <input
                    type="checkbox"
                    checked={form.autoCreateTasks}
                    onChange={(e) => set('autoCreateTasks', e.target.checked)}
                    className="toggle toggle-sm toggle-warning"
                  />
                </label>
              </div>

              {/* Auto Reminders */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${form.autoCreateReminders ? 'bg-blue-500/15 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-txt-main">Auto-create Reminders</p>
                    <p className="text-[11px] text-txt-sub">Automatically schedule client notifications</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-[11px] font-bold ${form.autoCreateReminders ? 'text-blue-600' : 'text-txt-sub'}`}>
                    {form.autoCreateReminders ? 'ON' : 'OFF'}
                  </span>
                  <input
                    type="checkbox"
                    checked={form.autoCreateReminders}
                    onChange={(e) => set('autoCreateReminders', e.target.checked)}
                    className="toggle toggle-sm toggle-info"
                  />
                </label>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </Drawer>
  );
}
