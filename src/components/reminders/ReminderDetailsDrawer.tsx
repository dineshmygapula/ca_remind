'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  User,
  Building2,
  Mail,
  MessageSquare,
  Smartphone,
  Loader2,
  AlertCircle,
  Pencil,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import { ReminderDetail, ReminderStatus } from '@/types/reminders.types';
import { getReminderById } from '@/services/reminderService';
import {
  REMINDER_STATUS_LABELS,
  REMINDER_CHANNEL_LABELS,
} from '@/constants/reminderConstants';

interface ReminderDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  reminderId: string | null;
  businessId: string;
  onEdit: (id: string) => void;
}

const getStatusBadge = (status?: ReminderStatus) => {
  switch (status) {
    case 'SENT':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'SCHEDULED':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'FAILED':
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'CANCELLED':
      return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    default:
      return 'bg-white/10 text-white/80 border-white/20';
  }
};

const ChannelIcon = ({ channel }: { channel?: string }) => {
  switch (channel?.toUpperCase()) {
    case 'EMAIL':
      return <Mail className="h-4 w-4 text-blue-500" />;
    case 'WHATSAPP':
      return <MessageSquare className="h-4 w-4 text-emerald-500" />;
    case 'SMS':
      return <Smartphone className="h-4 w-4 text-indigo-500" />;
    default:
      return <Bell className="h-4 w-4 text-amber-500" />;
  }
};

export default function ReminderDetailsDrawer({
  open,
  onClose,
  reminderId,
  businessId,
  onEdit,
}: ReminderDetailsDrawerProps) {
  const [reminder, setReminder] = useState<ReminderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !reminderId || !businessId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        setReminder(null);
        const data = await getReminderById(businessId, reminderId);
        setReminder(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to load reminder details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, reminderId, businessId]);

  const handleClose = () => {
    setReminder(null);
    setError('');
    onClose();
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

  const messageText =
    typeof reminder?.message === 'string'
      ? reminder.message
      : (reminder?.message as any)?.body || '';
  const messageTitle =
    typeof reminder?.message === 'object' && reminder?.message !== null
      ? (reminder.message as any).title
      : null;

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={reminder?.task?.title || (loading ? 'Loading...' : 'Reminder Details')}
      width="lg"
      customHeader={
        <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-slate-900 shadow-sm shrink-0">
              <Bell className="h-5 w-5 text-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                  Reminder Overview
                </p>
                {reminder && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      reminder.status
                    )}`}
                  >
                    {REMINDER_STATUS_LABELS[reminder.status] ?? reminder.status}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold leading-tight text-white truncate">
                {reminder?.task?.title || (loading ? 'Loading...' : 'Reminder Details')}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reminderId && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onEdit(reminderId);
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Edit Reminder"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-divider py-2.5 px-6 text-sm font-semibold text-txt-main bg-surface transition-colors hover:bg-bg cursor-pointer"
          >
            Close
          </button>
          {reminderId && (
            <button
              type="button"
              onClick={() => {
                handleClose();
                onEdit(reminderId);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Pencil className="h-4 w-4 text-slate-900" />
              <span>Edit reminder</span>
            </button>
          )}
        </div>
      }
    >
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-txt-sub">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B] mb-2" />
          <span className="text-sm font-medium">Loading reminder details...</span>
        </div>
      )}

      {error && (
        <div role="alert" className="alert alert-error mb-4 flex items-center gap-2 text-sm rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {reminder && !loading && (
        <div className="space-y-5 py-2">
          {/* ── Section 1: Reminder Overview ── */}
          <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-divider">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-bold text-txt-main">
                  Configuration &amp; Details
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg border border-divider text-txt-main">
                  <ChannelIcon channel={reminder.channel} />
                  <span>{REMINDER_CHANNEL_LABELS[reminder.channel] ?? reminder.channel}</span>
                </span>
              </div>
            </div>

            <div className="divide-y divide-divider">
              <InfoRow
                label="Associated Task"
                value={
                  <div className="font-semibold text-txt-main">
                    {reminder.task?.title ?? '—'}
                  </div>
                }
                icon={FileText}
              />

              <InfoRow
                label="Task Due Date"
                value={
                  reminder.task?.dueDate ? (
                    <span className="font-medium text-txt-main">
                      {new Date(reminder.task.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  ) : (
                    '—'
                  )
                }
                icon={Calendar}
              />

              <InfoRow
                label="Client / Subject"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-txt-main">
                      {reminder.subject?.name ?? '—'}
                    </span>
                    {reminder.subject?.type && (
                      <span className="text-xs text-txt-sub">({reminder.subject.type})</span>
                    )}
                  </div>
                }
                icon={Building2}
              />

              {(reminder.recipient?.value || reminder.recipient?.type) && (
                <InfoRow
                  label="Recipient"
                  value={
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{reminder.recipient?.value}</span>
                      {reminder.recipient?.type && (
                        <span className="text-xs text-txt-sub">
                          ({reminder.recipient.type})
                        </span>
                      )}
                    </div>
                  }
                  icon={User}
                />
              )}

              <InfoRow
                label="Scheduled At"
                value={
                  reminder.scheduledAt
                    ? new Date(reminder.scheduledAt).toLocaleString('en-IN')
                    : '—'
                }
                icon={Clock}
              />

              {reminder.sentAt && (
                <InfoRow
                  label="Sent At"
                  value={new Date(reminder.sentAt).toLocaleString('en-IN')}
                  icon={CheckCircle2}
                />
              )}

              {reminder.createdAt && (
                <InfoRow
                  label="Created At"
                  value={new Date(reminder.createdAt).toLocaleString('en-IN')}
                  icon={Clock}
                />
              )}
            </div>
          </div>

          {/* ── Section 2: Message Payload ── */}
          {(messageTitle || messageText) && (
            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-bold text-txt-main">Message Payload</h3>
              </div>

              {messageTitle && (
                <p className="text-xs font-bold text-txt-main">{messageTitle}</p>
              )}
              {messageText && (
                <div className="p-4 rounded-xl bg-bg/50 border border-divider text-xs text-txt-main whitespace-pre-wrap leading-relaxed font-sans">
                  {messageText}
                </div>
              )}
            </div>
          )}

          {/* ── Error Banner if any ── */}
          {reminder.lastError && (
            <div className="rounded-2xl border border-red-200 dark:border-rose-900 bg-red-50/70 dark:bg-rose-950/30 p-4 text-xs text-red-700 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span>Dispatch Error</span>
              </div>
              <p className="break-words font-mono text-[11px]">{reminder.lastError}</p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}