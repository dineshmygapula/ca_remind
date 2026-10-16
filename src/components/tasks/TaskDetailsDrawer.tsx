'use client';

import { useEffect, useState } from 'react';
import {
  Pencil,
  Calendar,
  Layers,
  Repeat,
  CheckCircle2,
  Clock,
  User,
  Building2,
  FileText,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Loader2,
  AlertCircle,
  ClipboardList,
  RotateCcw,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import { getTaskById, updateTask } from '@/services/taskService';
import { TaskResponse, TaskStatus } from '@/types/task.types';
import { useToast } from '@/context/ToastContext';

interface TaskDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  taskId: string | null;
  businessId: string;
  onEdit: (taskId: string) => void;
  onRefresh?: () => void;
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    case 'IN_PROGRESS':
      return 'bg-blue-500/20 text-blue-300 border-blue-400/40';
    case 'PENDING':
      return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
    case 'CANCELLED':
      return 'bg-red-500/20 text-red-300 border-red-400/40';
    case 'CLOSED':
      return 'bg-slate-500/20 text-slate-300 border-slate-400/40';
    default:
      return 'bg-white/10 text-white/70 border-white/20';
  }
};

const getDaysUntilDue = (dueDateStr?: string) => {
  if (!dueDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600 bg-red-50 border-red-200' };
  if (diffDays === 0) return { text: 'Due today', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  return { text: `in ${diffDays} days`, color: 'text-txt-sub bg-slate-50 border-slate-200' };
};

export default function TaskDetailsDrawer({
  open,
  onClose,
  taskId,
  businessId,
  onEdit,
  onRefresh,
}: TaskDetailsDrawerProps) {
  const toast = useToast();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!open || !taskId || !businessId) return;

    const fetchTask = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getTaskById(businessId, taskId);
        setTask(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [open, taskId, businessId]);

  useEffect(() => {
    if (!open) {
      setTask(null);
      setError('');
    }
  }, [open]);

  const handleToggleStatus = async () => {
    if (!task || !taskId || !businessId) return;
    const isCompleted = task.status === 'COMPLETED';
    const nextStatus: TaskStatus = isCompleted ? 'OPEN' : 'COMPLETED';

    try {
      setStatusUpdating(true);
      const updated = await updateTask(businessId, taskId, { status: nextStatus });
      setTask(updated);
      toast.success(isCompleted ? 'Task reopened' : 'Task marked as completed');
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task status');
    } finally {
      setStatusUpdating(false);
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

  const ChannelIcon = ({ channel }: { channel: string }) => {
    switch (channel?.toUpperCase()) {
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5 text-blue-500" />;
      case 'WHATSAPP':
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />;
      case 'SMS':
        return <Smartphone className="h-3.5 w-3.5 text-indigo-500" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  const dueDate = task?.dates?.dueDate || task?.dueDate;
  const relativeDue = getDaysUntilDue(dueDate);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="Task Overview"
      title={task?.title || (loading ? 'Loading...' : 'Task Details')}
      width="md"
      badge={
        task ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
              task.status
            )}`}
          >
            {task.status}
          </span>
        ) : undefined
      }
      icon={<ClipboardList className="h-4 w-4 text-[var(--accent)]" />}
      headerActions={
        taskId && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(taskId);
            }}
            aria-label="Edit task"
            className="rounded-xl bg-white/10 border border-white/20 p-1.5 transition-all hover:bg-white/25 hover:scale-105 text-white"
            title="Edit Task"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )
      }
      footer={
        task ? (
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={statusUpdating}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
              task.status === 'COMPLETED'
                ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
            } disabled:opacity-50`}
          >
            {statusUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            {task.status === 'COMPLETED' ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Reopen Task
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Mark as Completed
              </>
            )}
          </button>
        ) : undefined
      }
    >
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-txt-sub">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mb-2" />
          <span className="text-sm">Loading task details...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {task && !loading && (
        <div className="space-y-4">
          {/* ── Main Details Card ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
            {/* Chips row */}
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[var(--border)]/70">
              {task.taskType && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-[var(--surface-subtle)] text-txt-main border border-[var(--border)]">
                  {task.taskType}
                </span>
              )}
              {task.taskSource && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {task.taskSource === 'AUTO_GENERATED' ? 'Auto Generated' : 'Manual'}
                </span>
              )}
            </div>

            {/* Info Rows */}
            <div className="divide-y divide-[var(--border)]/40">
              <InfoRow
                label="Client / Subject"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-txt-main">
                      {task.subject?.name ?? '—'}
                    </span>
                    {task.subject?.type && (
                      <span className="badge badge-xs badge-ghost text-txt-sub">
                        {task.subject.type}
                      </span>
                    )}
                  </div>
                }
                icon={Building2}
              />

              <InfoRow
                label="Due Date"
                value={
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold">
                      {dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : '—'}
                    </span>
                    {relativeDue && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${relativeDue.color}`}
                      >
                        {relativeDue.text}
                      </span>
                    )}
                  </div>
                }
                icon={Calendar}
              />

              {task.assignee?.name && (
                <InfoRow
                  label="Assigned Staff"
                  value={task.assignee.name}
                  icon={User}
                />
              )}

              {task.frequency && (
                <InfoRow
                  label="Frequency"
                  value={task.frequency}
                  icon={Repeat}
                />
              )}

              {task.periodLabel && (
                <InfoRow
                  label="Period Label"
                  value={task.periodLabel}
                  icon={Clock}
                />
              )}

              {task.notes && (
                <InfoRow
                  label="Notes"
                  value={task.notes}
                  icon={FileText}
                />
              )}
            </div>
          </div>

          {/* ── Reminders Card ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-txt-main">Scheduled Reminders</h3>
              </div>
              <span className="badge badge-sm badge-ghost text-txt-sub">
                {(task.reminders?.upcoming?.length || 0) + (task.reminders?.sent?.length || 0)} total
              </span>
            </div>

            {(!task.reminders?.upcoming?.length && !task.reminders?.sent?.length) ? (
              <p className="text-xs text-txt-sub italic py-1">No reminders scheduled for this task.</p>
            ) : (
              <div className="space-y-2">
                {task.reminders?.upcoming?.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ChannelIcon channel={r.channel} />
                      <span className="font-semibold text-txt-main truncate">{r.channel}</span>
                      <span className="text-[10px] text-txt-sub">
                        {new Date(r.scheduledAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="badge badge-xs badge-info text-white font-bold">{r.status}</span>
                  </div>
                ))}

                {task.reminders?.sent?.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs opacity-75"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ChannelIcon channel={r.channel} />
                      <span className="font-semibold text-txt-main truncate">{r.channel}</span>
                      <span className="text-[10px] text-txt-sub">
                        Sent {r.sentAt ? new Date(r.sentAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    <span className="badge badge-xs badge-success text-white font-bold">{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
