'use client';

import { useMemo } from 'react';
import { Eye, Pencil, Trash2, Mail, MessageSquare, Smartphone, Bell } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn } from '@/components/common/CommonTable';
import { ReminderDetail, ReminderStatus } from '@/types/reminders.types';
import { updateReminder } from '@/services/reminderService';
import {
  REMINDER_STATUS_LABELS,
  REMINDER_CHANNEL_LABELS,
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

const getStatusBadge = (status?: ReminderStatus) => {
  switch (status) {
    case 'SENT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'SCHEDULED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const ChannelRenderer = ({ channel }: { channel?: string }) => {
  switch (channel?.toUpperCase()) {
    case 'EMAIL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Mail className="h-3.5 w-3.5 text-blue-500" />
          <span>Email</span>
        </span>
      );
    case 'WHATSAPP':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
          <span>WhatsApp</span>
        </span>
      );
    case 'SMS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Smartphone className="h-3.5 w-3.5 text-indigo-500" />
          <span>SMS</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
          <Bell className="h-3.5 w-3.5 text-slate-500" />
          <span>{channel ?? '—'}</span>
        </span>
      );
  }
};

const getRelativeScheduledText = (scheduledAt?: string) => {
  if (!scheduledAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(scheduledAt);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-red-600 font-bold' };
  if (diffDays === 0) return { text: 'Today', color: 'text-amber-600 font-bold' };
  if (diffDays === 1) return { text: 'Tomorrow', color: 'text-blue-600 font-bold' };
  return { text: `in ${diffDays}d`, color: 'text-txt-sub' };
};

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
        headerName: 'Task',
        colId: 'taskTitle',
        valueGetter: (p) => p.data?.task?.title ?? '—',
        minWidth: 220,
        flex: 2,
      },
      {
        headerName: 'Subject',
        colId: 'subjectName',
        valueGetter: (p) => p.data?.subject?.name ?? '—',
        minWidth: 160,
      },
      {
        headerName: 'Task Type',
        field: 'taskType',
        minWidth: 130,
        cellRenderer: (p) => (
          <span className="text-xs font-medium text-txt-main">
            {p.value || '—'}
          </span>
        ),
      },
      {
        headerName: 'Channel',
        field: 'channel',
        minWidth: 130,
        cellRenderer: (p) => <ChannelRenderer channel={p.data?.channel} />,
      },
      {
        headerName: 'Status',
        field: 'status',
        minWidth: 140,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['SCHEDULED', 'SENT', 'FAILED', 'CANCELLED'],
        },
        cellRenderer: (p) => {
          const status = p.data?.status;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                status
              )}`}
            >
              {REMINDER_STATUS_LABELS[status ?? ''] ?? status}
            </span>
          );
        },
      },
      {
        headerName: 'Scheduled At',
        field: 'scheduledAt',
        minWidth: 180,
        cellRenderer: (p) => {
          if (!p.data?.scheduledAt) {
            return <span className="text-xs text-txt-sub">Not scheduled</span>;
          }
          const date = new Date(p.data.scheduledAt);
          const dateStr = date.toLocaleDateString('en-IN');
          const timeStr = date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const rel = getRelativeScheduledText(p.data.scheduledAt);

          return (
            <div className="flex flex-col justify-center py-1 leading-tight">
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-txt-main">
                <span>{dateStr}</span>
                <span className="text-[10px] text-txt-sub">{timeStr}</span>
              </div>
              {rel && (
                <span className={`text-[10px] ${rel.color}`}>
                  {rel.text}
                </span>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const actions: GridAction<ReminderDetail>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      variant: 'primary',
      onClick: (row) => onView(row.id),
    },
    {
      label: 'Edit',
      icon: <Pencil className="h-4 w-4" />,
      variant: 'secondary',
      onClick: (row) => onEdit(row.id),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger',
      onClick: (row) => onDelete(row.id, row.task?.title || 'Reminder'),
    },
  ];

  return (
    <CommonDataGrid<ReminderDetail>
      rowData={reminders}
      columns={columns}
      actions={actions}
      isLoading={loading}
      onRowClick={(row) => onView(row.id)}
      onRowDoubleClick={(row) => onEdit(row.id)}
      onUpdateCell={async ({ row, field, newValue }) => {
        if (!businessId) return;
        await updateReminder(businessId, row.id, {
          [field]: newValue,
        });
        onRefresh?.();
      }}
      emptyMessage="No reminders found"
    />
  );
}
