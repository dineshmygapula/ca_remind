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
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    case 'SCHEDULED':
      return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
    case 'FAILED':
      return 'bg-red-500/20 text-red-300 border-red-400/40';
    case 'CANCELLED':
      return 'bg-slate-500/20 text-slate-300 border-slate-400/40';
    default:
      return 'bg-white/10 text-white/70 border-white/20';
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
    <Drawer
      open={open}
      onClose={handleClose}
      eyebrow="Reminder Overview"
      title={reminder?.task?.title || (loading ? 'Loading...' : 'Reminder Details')}
      width="md"
      badge={
        reminder ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
              reminder.status
            )}`}
          >
            {REMINDER_STATUS_LABELS[reminder.status] ?? reminder.status}
          </span>
        ) : undefined
      }
      icon={<Bell className="h-4 w-4 text-[var(--accent)]" />}
      headerActions={
        reminderId && (
          <button
            type="button"
            onClick={() => {
              handleClose();
              onEdit(reminderId);
            }}
            aria-label="Edit reminder"
            className="rounded-xl bg-white/10 border border-white/20 p-1.5 transition-all hover:bg-white/25 hover:scale-105 text-white"
            title="Edit Reminder"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )
      }
      footer={
        reminder ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                handleClose();
                onEdit(reminder.id);
              }}
              className="btn btn-outline btn-sm flex-1 font-bold"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Reminder
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost btn-sm text-txt-sub"
            >
              Close
            </button>
          </div>
        ) : undefined
      }
    >
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-txt-sub">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mb-2" />
          <span className="text-sm">Loading reminder details...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && reminder && (
        <div className="space-y-4">
          {/* Main Details Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[var(--border)]/70">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <ChannelIcon channel={reminder.channel} />
                <span>{REMINDER_CHANNEL_LABELS[reminder.channel] ?? reminder.channel}</span>
              </span>

              {reminder.taskType && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[var(--surface-subtle)] text-txt-main border border-[var(--border)]">
                  {reminder.taskType}
                </span>
              )}
            </div>

            <div className="divide-y divide-[var(--border)]/40">
              <InfoRow
                label="Task Title"
                value={reminder.task?.title}
                icon={FileText}
              />

              <InfoRow
                label="Task Due Date"
                value={
                  reminder.task?.dueDate
                    ? new Date(reminder.task.dueDate).toLocaleDateString('en-IN')
                    : '—'
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
                      <span className="badge badge-xs badge-ghost text-txt-sub">
                        {reminder.subject.type}
                      </span>
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
                        <span className="badge badge-xs badge-outline text-txt-sub">
                          {reminder.recipient.type}
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

          {/* Message Content Card */}
          {reminder.message && (reminder.message.title || reminder.message.body) && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-txt-sub mb-2">
                <MessageSquare className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>Message Payload</span>
              </div>
              {reminder.message.title && (
                <p className="text-xs font-bold text-txt-main mb-1">
                  {reminder.message.title}
                </p>
              )}
              {reminder.message.body && (
                <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs text-txt-main whitespace-pre-wrap leading-relaxed font-sans">
                  {reminder.message.body}
                </div>
              )}
            </div>
          )}

          {/* Last Error Card */}
          {reminder.lastError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 space-y-1">
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