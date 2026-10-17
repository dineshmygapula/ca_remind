'use client';

import React, { useMemo } from 'react';
import { Eye, Pencil, Trash2, Mail, Smartphone, Bell, Calendar } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn, createTableActions } from '@/components/common/CommonTable';
import { ReminderDetail, ReminderStatus } from '@/types/reminders.types';
import { updateReminder } from '@/services/reminderService';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import {
  REMINDER_STATUS_LABELS,
} from '@/constants/reminderConstants';

interface RemindersTableProps {
  reminders: ReminderDetail[];
  loading: boolean;
  businessId: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, taskTitle: string) => void;
  onRefresh?: () => void;
}

// ─── Task Type Styling Helpers (Matching Task Definitions) ───
function getTaskTypePrefix(val?: string) {
  if (!val) return 'TASK';
  const upper = val.toUpperCase();
  if (upper.includes('GST')) return 'GST';
  if (upper.includes('TDS')) return 'TDS';
  if (upper.includes('ITR')) return 'ITR';
  if (upper.includes('ROC')) return 'ROC';
  if (upper.includes('MSME')) return 'MSME';
  return val.split('_')[0] || 'TASK';
}

function getTaskTypeBadgeClass(val?: string) {
  const prefix = getTaskTypePrefix(val);
  if (prefix === 'TDS') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
  if (prefix === 'ITR') return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';
  if (prefix === 'GST') return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (prefix === 'ROC') return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

// ─── Channel Badge Renderer with authentic WhatsApp Icon ─────
function ChannelBadge({ channel }: { channel?: string }) {
  const ch = (channel || '').toUpperCase();

  if (ch === 'WHATSAPP') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 shadow-2xs">
        <WhatsAppIcon size={14} className="fill-current shrink-0 text-[#047857] dark:text-emerald-300" />
        <span>WhatsApp</span>
      </span>
    );
  }

  if (ch === 'EMAIL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8] dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 shadow-2xs">
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span>Email</span>
      </span>
    );
  }

  if (ch === 'SMS') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef2ff] text-[#4338ca] dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 shadow-2xs">
        <Smartphone className="h-3.5 w-3.5 shrink-0" />
        <span>SMS</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 shadow-2xs">
      <Bell className="h-3.5 w-3.5 shrink-0" />
      <span>{channel || '—'}</span>
    </span>
  );
}

// ─── Status Badge Renderer (Matching DaisyUI & Task Definitions) ───
function StatusBadge({ status }: { status?: ReminderStatus }) {
  switch (status) {
    case 'SENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span>Sent</span>
        </span>
      );
    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
          <span>Scheduled</span>
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
          <span>Failed</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>{status || '—'}</span>
        </span>
      );
  }
}

// ─── Date Difference Helper ─────────────────────────────────
function getRelativeDateDiff(scheduledAt?: string) {
  if (!scheduledAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(scheduledAt);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatScheduledDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { formattedDate: `${day} ${month} ${year}`, time };
  } catch {
    return null;
  }
}

// ─── Reminders Table Component ──────────────────────────────
export default function RemindersTable({
  reminders,
  loading,
  businessId,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: RemindersTableProps) {
  const columns: GridColumn<ReminderDetail>[] = useMemo(
    () => [
      {
        headerName: 'Task & Client',
        field: 'task',
        minWidth: 260,
        flex: 2.5,
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;

          const taskTitle = row.task?.title || 'Reminder Notification';
          const clientName = row.subject?.name;
          const taskType = row.taskType || row.task?.title || '';
          const prefix = getTaskTypePrefix(taskType);
          const badgeClass = getTaskTypeBadgeClass(taskType);

          return (
            <div className="flex items-center gap-3 py-1">
              <span
                className={`w-11 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeClass}`}
              >
                {prefix}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-[var(--primary)] dark:text-slate-100 truncate">
                  {taskTitle}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {clientName ? `Client: ${clientName}` : 'General reminder'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Channel',
        field: 'channel',
        minWidth: 140,
        flex: 1.1,
        cellRenderer: (p) => <ChannelBadge channel={p.data?.channel} />,
      },
      {
        headerName: 'Task Type',
        field: 'taskType',
        minWidth: 130,
        flex: 1,
        cellRenderer: (p) => {
          const val = p.value || p.data?.task?.title;
          const prefix = getTaskTypePrefix(val);
          return (
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {prefix}
            </span>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        minWidth: 140,
        flex: 1.1,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['SCHEDULED', 'SENT', 'FAILED', 'CANCELLED'],
        },
        cellRenderer: (p) => (
          <StatusBadge status={(p.value ?? p.data?.status) as ReminderStatus} />
        ),
      },
      {
        headerName: 'Scheduled At',
        field: 'scheduledAt',
        minWidth: 190,
        flex: 1.5,
        editable: true,
        cellRenderer: (p) => {
          const dateVal = p.value || p.data?.scheduledAt;
          if (!dateVal) {
            return <span className="text-xs text-slate-400">—</span>;
          }

          const parsed = formatScheduledDate(dateVal);
          const diffDays = getRelativeDateDiff(dateVal);

          if (!parsed) {
            return <span className="text-xs text-slate-400">{dateVal}</span>;
          }

          return (
            <div className="flex flex-col justify-center py-1 leading-tight">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  {parsed.formattedDate}
                </span>
                <span className="text-[11px] text-slate-400">
                  {parsed.time}
                </span>
              </div>
              {diffDays !== null && (
                <div className="mt-0.5">
                  {diffDays < 0 ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef2f2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400">
                      {Math.abs(diffDays)}d overdue
                    </span>
                  ) : diffDays === 0 ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400">
                      Scheduled today
                    </span>
                  ) : diffDays === 1 ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eef2ff] text-[#4f46e5] dark:bg-indigo-950/40 dark:text-indigo-400">
                      Tomorrow
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eef2ff] text-[#4f46e5] dark:bg-indigo-950/40 dark:text-indigo-400">
                      In {diffDays} days
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const actions: GridAction<ReminderDetail>[] = useMemo(
    () =>
      createTableActions<ReminderDetail>({
        onView: (row) => onView(row.id),
        onEdit: (row) => onEdit(row.id),
        onDelete: (row) => onDelete(row.id, row.task?.title || 'Reminder'),
      }),
    [onView, onEdit, onDelete]
  );

  return (
    <CommonDataGrid<ReminderDetail>
      rowData={reminders}
      columns={columns}
      actions={actions}
      isLoading={loading}
      rowHeight={64}
      onUpdateCell={async ({ row, field, newValue }) => {
        if (!businessId) return;
        let valToSave: unknown = newValue;
        if (field === 'scheduledAt' && typeof newValue === 'string' && newValue.trim()) {
          const d = new Date(newValue);
          if (!isNaN(d.getTime())) {
            valToSave = d.toISOString();
          }
        }
        await updateReminder(businessId, row.id, {
          [field]: valToSave,
        });
        onRefresh?.();
      }}
      emptyMessage="No reminders found"
    />
  );
}
