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
  X,
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
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'IN_PROGRESS':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'PENDING':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'CANCELLED':
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'CLOSED':
      return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    default:
      return 'bg-white/10 text-white/80 border-white/20';
  }
};

const getDaysUntilDue = (dueDateStr?: string) => {
  if (!dueDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)
    return {
      text: `${Math.abs(diffDays)} days overdue`,
      color: 'text-red-600 bg-red-50 border-red-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
    };
  if (diffDays === 0)
    return {
      text: 'Due today',
      color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    };
  if (diffDays === 1)
    return {
      text: 'Due tomorrow',
      color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
    };
  return {
    text: `in ${diffDays} days`,
    color: 'text-txt-sub bg-bg border-divider',
  };
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
      title={task?.title || (loading ? 'Loading...' : 'Task Details')}
      width="lg"
      customHeader={
        <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-slate-900 shadow-sm shrink-0">
              <ClipboardList className="h-5 w-5 text-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                  Task Overview
                </p>
                {task && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold leading-tight text-white truncate">
                {task?.title || (loading ? 'Loading...' : 'Task Details')}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {taskId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(taskId);
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Edit Task"
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
        task ? (
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
              onClick={handleToggleStatus}
              disabled={statusUpdating}
              className={`inline-flex items-center gap-2 rounded-xl py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                task.status === 'COMPLETED'
                  ? 'border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
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
          </div>
        ) : undefined
      }
    >
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-txt-sub">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B] mb-2" />
          <span className="text-sm font-medium">Loading task details...</span>
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error mb-4 flex items-center gap-2 text-sm rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {task && !loading && (
        <div className="space-y-5 py-2">
          {/* ── Section 1: Task Overview ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-bold text-txt-main">Task Overview</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {task.taskType && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg text-txt-main border border-divider">
                    {task.taskType}
                  </span>
                )}
                {task.taskSource && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    {task.taskSource === 'AUTO_GENERATED' ? 'Auto Generated' : 'Manual'}
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-divider">
              <InfoRow
                label="Client / Subject"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-txt-main">
                      {task.subject?.name ?? '—'}
                    </span>
                    {task.subject?.type && (
                      <span className="text-xs text-txt-sub">({task.subject.type})</span>
                    )}
                  </div>
                }
                icon={Building2}
              />

              <InfoRow
                label="Due Date"
                value={
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-txt-main">
                      {dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : '—'}
                    </span>
                    {relativeDue && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${relativeDue.color}`}
                      >
                        {relativeDue.text}
                      </span>
                    )}
                  </div>
                }
                icon={Calendar}
              />

              {task.assignee?.name && (
                <InfoRow label="Assigned Staff" value={task.assignee.name} icon={User} />
              )}

              {task.frequency && (
                <InfoRow label="Frequency" value={task.frequency} icon={Repeat} />
              )}

              {task.periodLabel && (
                <InfoRow label="Period Label" value={task.periodLabel} icon={Clock} />
              )}

              {task.notes && (
                <InfoRow label="Notes" value={task.notes} icon={FileText} />
              )}
            </div>
          </div>

          {/* ── Section 2: Scheduled Reminders ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-bold text-txt-main">Scheduled Reminders</h3>
              </div>
              <span className="text-xs font-semibold text-txt-sub">
                {(task.reminders?.upcoming?.length || 0) + (task.reminders?.sent?.length || 0)} total
              </span>
            </div>

            {!task.reminders?.upcoming?.length && !task.reminders?.sent?.length ? (
              <p className="text-xs text-txt-sub italic py-2">
                No reminders scheduled for this task.
              </p>
            ) : (
              <div className="space-y-2.5">
                {task.reminders?.upcoming?.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg/60 border border-divider text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ChannelIcon channel={r.channel} />
                      <span className="font-semibold text-txt-main truncate">{r.channel}</span>
                      <span className="text-[11px] text-txt-sub">
                        {new Date(r.scheduledAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      {r.status}
                    </span>
                  </div>
                ))}

                {task.reminders?.sent?.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg/30 border border-divider text-xs opacity-75"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ChannelIcon channel={r.channel} />
                      <span className="font-semibold text-txt-main truncate">{r.channel}</span>
                      <span className="text-[11px] text-txt-sub">
                        Sent {r.sentAt ? new Date(r.sentAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {r.status}
                    </span>
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
