'use client';

import { useEffect, useState } from 'react';
import {
  Pencil,
  Calendar,
  Layers,
  Repeat,
  CheckCircle2,
  Bell,
  FileText,
  Clock,
  UserPlus,
  Loader2,
  AlertCircle,
  Sliders,
  X,
  Power,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import {
  getTaskDefinitionById,
  updateTaskDefinition,
} from '@/services/taskDefinitionService';
import { MONTHS } from '@/constants/taskDefinition.constants';
import { TaskDefinition } from '@/types/taskDefinition.types';
import ReminderRulesListDrawer from './ReminderRulesListDrawer';
import { getV2ReminderDefinitions } from '@/services/reminderDefinitionService';
import { V2ReminderDefinition } from '@/types/v2ReminderDefinition.types';

interface TaskDefinitionDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  definitionId: string | null;
  businessId: string;
  onEdit: (definitionId: string) => void;
  onRefresh?: () => void;
  refreshKey?: number;
}

export default function TaskDefinitionDetailsDrawer({
  open,
  onClose,
  definitionId,
  businessId,
  onEdit,
  onRefresh,
  refreshKey,
}: TaskDefinitionDetailsDrawerProps) {
  const [definition, setDefinition] = useState<TaskDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);

  const [reminderRulesOpen, setReminderRulesOpen] = useState(false);
  const [reminderRules, setReminderRules] = useState<V2ReminderDefinition[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);

  // ─── Fetch Reminder Rules ───────────────────────────────────────────────
  useEffect(() => {
    if (!open || !definitionId || !businessId) return;

    const fetchReminderRules = async () => {
      try {
        setLoadingReminders(true);
        const allRules = await getV2ReminderDefinitions(businessId);
        const taskRules = allRules.filter(
          (rule) => rule.taskDefinitionId === definitionId
        );
        setReminderRules(taskRules);
      } catch (err) {
        console.error('Failed to load reminder rules', err);
        setReminderRules([]);
      } finally {
        setLoadingReminders(false);
      }
    };

    fetchReminderRules();
  }, [open, businessId, definitionId]);

  // ─── Fetch Definition Details ───────────────────────────────────────────
  useEffect(() => {
    if (!open || !definitionId || !businessId) return;

    const fetchDefinitionDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getTaskDefinitionById(businessId, definitionId);
        setDefinition(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to load task definition'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitionDetails();
  }, [open, definitionId, businessId, refreshKey]);

  // Clear state when drawer closes
  useEffect(() => {
    if (!open) {
      setDefinition(null);
      setError('');
    }
  }, [open]);

  // ─── Enable / Disable Handler ───────────────────────────────────────────
  const handleToggleActive = async () => {
    if (!definition || !definitionId || !businessId) return;
    setToggling(true);
    try {
      const updated = await updateTaskDefinition(businessId, definitionId, {
        isActive: !definition.isActive,
      });
      setDefinition(updated);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-500 border-red-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/40';
      case 'LOW':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
      default:
        return 'bg-slate-400/20 text-slate-400 border-slate-400/40';
    }
  };

  const formatFrequencyLabel = (pattern?: string): string => {
    switch (pattern) {
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'half_yearly':
      case 'halfYearly':
        return 'Half-Yearly';
      case 'yearly':
        return 'Yearly';
      case 'one_time':
      case 'oneTime':
        return 'One-Time';
      default:
        return pattern || '—';
    }
  };

  const formatScheduleDetail = (def: TaskDefinition): string => {
    const s = def.scheduleRule;
    if (!s) return '—';

    switch (s.pattern) {
      case 'monthly':
        return s.monthly?.day !== undefined ? `Day ${s.monthly.day} of every month` : 'Monthly';
      case 'quarterly': {
        const q = s.quarterly;
        if (!q) return 'Quarterly';
        const parts: string[] = [];
        if (q.q1Month !== undefined && q.q1Day !== undefined) {
          parts.push(`Q1: ${MONTHS.find((m) => m.value === q.q1Month)?.label || q.q1Month} ${q.q1Day}`);
        }
        if (q.q2Month !== undefined && q.q2Day !== undefined) {
          parts.push(`Q2: ${MONTHS.find((m) => m.value === q.q2Month)?.label || q.q2Month} ${q.q2Day}`);
        }
        if (q.q3Month !== undefined && q.q3Day !== undefined) {
          parts.push(`Q3: ${MONTHS.find((m) => m.value === q.q3Month)?.label || q.q3Month} ${q.q3Day}`);
        }
        if (q.q4Month !== undefined && q.q4Day !== undefined) {
          parts.push(`Q4: ${MONTHS.find((m) => m.value === q.q4Month)?.label || q.q4Month} ${q.q4Day}`);
        }
        return parts.length ? parts.join(', ') : 'Quarterly';
      }
      case 'half_yearly': {
        const h = s.halfYearly;
        if (!h) return 'Half-Yearly';
        const parts: string[] = [];
        if (h.firstHalf) {
          parts.push(`H1: ${MONTHS.find((m) => m.value === h.firstHalf?.month)?.label} ${h.firstHalf?.day}`);
        }
        if (h.secondHalf) {
          parts.push(`H2: ${MONTHS.find((m) => m.value === h.secondHalf?.month)?.label} ${h.secondHalf?.day}`);
        }
        return parts.join(', ');
      }
      case 'yearly': {
        const y = s.yearly;
        if (!y) return 'Yearly';
        const monthLabel = MONTHS.find((m) => m.value === y.month)?.label || y.month;
        return `${monthLabel} ${y.day}`;
      }
      case 'one_time': {
        const due = s.oneTime?.dueDate;
        if (!due) return 'One-Time';
        try {
          return new Date(due).toLocaleDateString('en-IN');
        } catch {
          return due;
        }
      }
      default:
        return '—';
    }
  };

  const InfoRow = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-divider/60 last:border-b-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg text-txt-sub">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-txt-sub">
          {label}
        </p>
        <div className="text-sm font-medium text-txt-main mt-0.5 break-words">
          {value ?? '—'}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={definition?.name || (loading ? 'Loading...' : 'Task Definition')}
        width="lg"
        customHeader={
          <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-slate-900 shadow-sm shrink-0">
                <Sliders className="h-5 w-5 text-slate-900" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                    Rule Setup
                  </p>
                  {definition && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${definition.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-white/10 text-white/80 border-white/20'
                        }`}
                    >
                      {definition.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold leading-tight text-white truncate">
                  {definition?.name || (loading ? 'Loading...' : 'Task Definition')}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {definitionId && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(definitionId);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit Rule"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
        footer={
          definition ? (
            <div className="flex items-center justify-between gap-3 w-full">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-divider py-2.5 px-6 text-sm font-semibold text-txt-main bg-surface transition-colors hover:bg-bg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={toggling}
                className={`inline-flex items-center gap-2 rounded-xl py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${definition.isActive
                    ? 'border border-red-300 dark:border-rose-800 text-red-600 dark:text-rose-300 bg-red-50 dark:bg-rose-950/40 hover:bg-red-100'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
              >
                {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
                <Power className="h-4 w-4" />
                <span>
                  {toggling
                    ? definition.isActive
                      ? 'Disabling…'
                      : 'Enabling…'
                    : definition.isActive
                      ? 'Disable Rule'
                      : 'Enable Rule'}
                </span>
              </button>
            </div>
          ) : undefined
        }
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-txt-sub">
            <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B] mb-2" />
            <span className="text-sm font-medium">Loading rule details...</span>
          </div>
        )}

        {error && (
          <div role="alert" className="alert alert-error mb-4 flex items-center gap-2 text-sm rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {definition && !loading && (
          <div className="space-y-5 py-2">
            {/* ── Section 1: Main Details ── */}
            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-divider">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-base font-bold text-txt-main">Rule Overview</h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getPriorityBadgeClass(
                      definition.priority
                    )}`}
                  >
                    {definition.priority ?? 'MEDIUM'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg text-txt-main border border-divider">
                    {definition.subjectType ?? 'CLIENT'}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-divider">
                <InfoRow
                  label="Category / Task Type"
                  value={definition.taskType}
                  icon={Layers}
                />
                <InfoRow
                  label="Task Title Pattern"
                  value={definition.titleTemplate}
                  icon={FileText}
                />
                <InfoRow
                  label="Frequency"
                  value={formatFrequencyLabel(definition.scheduleRule?.pattern)}
                  icon={Repeat}
                />
                <InfoRow
                  label="Schedule Detail"
                  value={formatScheduleDetail(definition)}
                  icon={Calendar}
                />
                <InfoRow
                  label="Auto-create Tasks"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold text-xs ${definition.autoCreateTasks
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-txt-sub'
                        }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${definition.autoCreateTasks
                            ? 'text-emerald-500'
                            : 'text-slate-300 dark:text-slate-600'
                          }`}
                      />
                      {definition.autoCreateTasks ? 'Enabled' : 'Disabled'}
                    </span>
                  }
                  icon={CheckCircle2}
                />
                <InfoRow
                  label="Auto-create Reminders"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold text-xs ${definition.autoCreateReminders
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-txt-sub'
                        }`}
                    >
                      <Bell
                        className={`h-3.5 w-3.5 ${definition.autoCreateReminders
                            ? 'text-emerald-500'
                            : 'text-slate-300 dark:text-slate-600'
                          }`}
                      />
                      {definition.autoCreateReminders ? 'Enabled' : 'Disabled'}
                    </span>
                  }
                  icon={Bell}
                />
                {definition.targetOffsetDays !== undefined &&
                  definition.targetOffsetDays !== 0 && (
                    <InfoRow
                      label="Target Offset Days"
                      value={`${definition.targetOffsetDays} days`}
                      icon={Clock}
                    />
                  )}
                {definition.description && (
                  <InfoRow
                    label="Description"
                    value={definition.description}
                    icon={FileText}
                  />
                )}
              </div>
            </div>

            {/* ── Section 2: Reminders Summary Card ── */}
            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base font-bold text-txt-main">Reminder Rules</h3>
                </div>
                <span className="text-xs font-semibold text-txt-sub">
                  {reminderRules.length} rule{reminderRules.length !== 1 ? 's' : ''} configured
                </span>
              </div>
              <p className="text-xs text-txt-sub">
                {loadingReminders
                  ? 'Loading reminder rules...'
                  : `${reminderRules.length} reminder rule${reminderRules.length !== 1 ? 's' : ''
                  } configured for this task rule.`}
              </p>
              {!loadingReminders && reminderRules.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReminderRulesOpen(true)}
                  className="rounded-xl border border-divider bg-bg/50 px-4 py-2 text-xs font-bold text-txt-main hover:bg-bg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="h-3.5 w-3.5 text-[#F59E0B]" />
                  <span>View Reminder Rules &rarr;</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ReminderRulesListDrawer
        open={reminderRulesOpen}
        onClose={() => setReminderRulesOpen(false)}
        taskDefinitionId={definitionId}
        taskDefinitionName={definition?.name || ''}
        businessId={businessId}
        preloadedRules={reminderRules}
        onEditRule={(ruleId: string) => {
          setReminderRulesOpen(false);
          console.log('Edit rule:', ruleId);
        }}
      />
    </>
  );
}
