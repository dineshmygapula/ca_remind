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
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import {
  getTaskDefinitionById,
  updateTaskDefinition,
} from '@/services/taskDefinitionService';
import { MONTHS } from '@/constants/taskDefinition.constants';
import { TaskDefinition } from '@/types/taskDefinition.types';
import ReminderRulesListDrawer from '../reminderdefinitions/ReminderRulesListDrawer';
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
        return 'bg-red-500 text-white border-red-600';
      case 'HIGH':
        return 'bg-amber-500 text-white border-amber-600';
      case 'MEDIUM':
        return 'bg-blue-600 text-white border-blue-700';
      case 'LOW':
        return 'bg-slate-500 text-white border-slate-600';
      default:
        return 'bg-slate-400 text-white border-slate-500';
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
        return 'One Time';
      default:
        return pattern ?? '—';
    }
  };

  const getMonthName = (monthNum: number): string => {
    const month = MONTHS.find((m) => m.value === monthNum);
    return month?.label || monthNum.toString();
  };

  const formatScheduleDetail = (def: TaskDefinition): string => {
    const { scheduleRule } = def;
    if (!scheduleRule) return 'Not configured';

    const ordinal = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    switch (scheduleRule.pattern) {
      case 'monthly':
        return `${ordinal(scheduleRule.monthly?.day ?? 0)} of each month`;

      case 'quarterly': {
        const q = scheduleRule.quarterly;
        if (!q) return 'Quarterly';
        return [
          `Q1: ${getMonthName(q.q1Month)} ${ordinal(q.q1Day)}`,
          `Q2: ${getMonthName(q.q2Month)} ${ordinal(q.q2Day)}`,
          `Q3: ${getMonthName(q.q3Month)} ${ordinal(q.q3Day)}`,
          `Q4: ${getMonthName(q.q4Month)} ${ordinal(q.q4Day)}`,
        ].join('  •  ');
      }

      case 'half_yearly': {
        const h = scheduleRule.halfYearly;
        if (!h) return 'Half-Yearly';
        return [
          `H1: ${getMonthName(h.firstHalf.month)} ${ordinal(h.firstHalf.day)}`,
          `H2: ${getMonthName(h.secondHalf.month)} ${ordinal(h.secondHalf.day)}`,
        ].join('  •  ');
      }

      case 'yearly': {
        const y = scheduleRule.yearly;
        if (!y) return 'Yearly';
        return `${getMonthName(y.month)} ${ordinal(y.day)} each year`;
      }

      case 'one_time':
        if (scheduleRule.oneTime?.dueDate) {
          return new Date(scheduleRule.oneTime.dueDate).toLocaleDateString();
        }
        return 'One Time';

      default:
        return scheduleRule.pattern;
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
    <div className="flex items-start gap-3 py-2 border-b border-[var(--border)]/60 last:border-b-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--accent)]">
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
        eyebrow="Automatic Task & Reminder Setup"
        title={definition?.name || (loading ? 'Loading...' : 'Task Definition')}
        width="md"
        badge={
          definition ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                definition.isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-white/10 text-white/70 border-white/20'
              }`}
            >
              {definition.isActive ? 'Active' : 'Inactive'}
            </span>
          ) : undefined
        }
        icon={<Sliders className="h-4 w-4 text-[var(--accent)]" />}
        headerActions={
          definitionId && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(definitionId);
              }}
              aria-label="Edit task definition"
              className="rounded-xl bg-white/10 border border-white/20 p-1.5 transition-all hover:bg-white/25 hover:scale-105 text-white"
              title="Edit Task Definition"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )
        }
        footer={
          definition ? (
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={toggling}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                definition.isActive
                  ? 'border-red-300 text-red-600 hover:bg-red-50'
                  : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
              } disabled:opacity-50`}
            >
              {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
              {toggling
                ? definition.isActive
                  ? 'Disabling…'
                  : 'Enabling…'
                : definition.isActive
                ? 'Disable Definition'
                : 'Enable Definition'}
            </button>
          ) : undefined
        }
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-txt-sub">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mb-2" />
            <span className="text-sm">Loading task definition details...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-4 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {definition && !loading && (
          <div className="space-y-4">
            {/* ── Main Details Card ── */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
              {/* Chips row */}
              <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[var(--border)]/70">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${getPriorityBadgeClass(
                    definition.priority
                  )}`}
                >
                  {definition.priority ?? 'MEDIUM'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[var(--surface-subtle)] text-txt-main border border-[var(--border)]">
                  {definition.subjectType ?? 'CLIENT'}
                </span>
              </div>

              {/* Info Rows */}
              <div className="divide-y divide-[var(--border)]/40">
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
                      className={`inline-flex items-center gap-1.5 font-semibold text-xs ${
                        definition.autoCreateTasks
                          ? 'text-emerald-600'
                          : 'text-txt-sub'
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          definition.autoCreateTasks
                            ? 'text-emerald-500'
                            : 'text-slate-300'
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
                      className={`inline-flex items-center gap-1.5 font-semibold text-xs ${
                        definition.autoCreateReminders
                          ? 'text-emerald-600'
                          : 'text-txt-sub'
                      }`}
                    >
                      <Bell
                        className={`h-3.5 w-3.5 ${
                          definition.autoCreateReminders
                            ? 'text-emerald-500'
                            : 'text-slate-300'
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

            {/* ── Reminders Summary Card ── */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-txt-main">Reminders</h3>
                <span className="badge badge-sm badge-ghost text-txt-sub">
                  {reminderRules.length} rule{reminderRules.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-txt-sub mb-2">
                {loadingReminders
                  ? 'Loading reminder rules...'
                  : `${reminderRules.length} reminder rule${
                      reminderRules.length !== 1 ? 's' : ''
                    } configured`}
              </p>
              {!loadingReminders && reminderRules.length > 0 && (
                <button
                  type="button"
                  onClick={() => setReminderRulesOpen(true)}
                  className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                >
                  View Reminder Rules &rarr;
                </button>
              )}
            </div>

            {/* ── Assign Employee Card ── */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm opacity-70">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-txt-main">Assign Employee</h3>
                <span className="badge badge-xs badge-neutral">Coming Soon</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-txt-sub">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-txt-sub/40">
                  <UserPlus className="h-3 w-3" />
                </div>
                <span>Default assignee mapping per definition</span>
              </div>
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
