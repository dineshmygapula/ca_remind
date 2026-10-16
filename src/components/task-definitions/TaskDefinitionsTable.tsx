'use client';

import { useState, useMemo } from 'react';
import { Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn } from '@/components/common/CommonTable';
import { TaskDefinitionListItem } from '@/types/taskDefinition.types';
import { updateTaskDefinition } from '@/services/taskDefinitionService';
import { useToast } from '@/context/ToastContext';

interface TaskDefinitionsTableProps {
  definitions: TaskDefinitionListItem[];
  loading: boolean;
  businessId: string;
  onView: (definitionId: string) => void;
  onEdit: (definitionId: string) => void;
  onDelete: (definitionId: string, name: string) => void;
  onRefresh: () => void;
}

function getRuleTypePrefix(val?: string) {
  if (!val) return 'RULE';
  const upper = val.toUpperCase();
  if (upper.includes('GST')) return 'GST';
  if (upper.includes('TDS')) return 'TDS';
  if (upper.includes('ITR')) return 'ITR';
  if (upper.includes('ROC')) return 'ROC';
  if (upper.includes('MSME')) return 'MSME';
  return val.split('_')[0] || 'RULE';
}

function getRuleBadgeClass(val?: string) {
  const prefix = getRuleTypePrefix(val);
  if (prefix === 'TDS') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
  if (prefix === 'ITR') return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';
  if (prefix === 'GST') return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (prefix === 'ROC') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function getTaskTypeDescription(taskType?: string, name?: string) {
  const key = (taskType || name || '').toUpperCase();
  if (key.includes('GST')) return 'Goods & Services Tax';
  if (key.includes('TDS')) return 'Tax Deducted at Source';
  if (key.includes('ITR')) return 'Income Tax Return';
  if (key.includes('ROC')) return 'Registrar of Companies';
  if (key.includes('MSME')) return 'Ministry of MSME';
  return taskType || 'Compliance Rule';
}

function formatSchedulePattern(pattern?: string) {
  switch (pattern?.toLowerCase()) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'half_yearly':
    case 'halfyearly':
      return 'Half-Yearly';
    case 'yearly':
      return 'Yearly';
    case 'one_time':
    case 'onetime':
      return 'One Time';
    default:
      return pattern || '—';
  }
}

function ScheduleBadge({ pattern }: { pattern?: string }) {
  const label = formatSchedulePattern(pattern);
  const p = pattern?.toLowerCase() || '';

  if (p === 'yearly') {
    return (
      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-300">
        {label}
      </span>
    );
  }
  if (p === 'quarterly') {
    return (
      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-[#f3e8ff] text-[#7e22ce] dark:bg-purple-950/40 dark:text-purple-300">
        {label}
      </span>
    );
  }
  if (p === 'monthly') {
    return (
      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#0369a1] dark:bg-blue-950/40 dark:text-blue-300">
        {label}
      </span>
    );
  }
  if (p.includes('half')) {
    return (
      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-[#ccfbf1] text-[#0f766e] dark:bg-teal-950/40 dark:text-teal-300">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {label}
    </span>
  );
}

function formatNextDueDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function getDueDifferenceDays(dueDate?: string) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TaskDefinitionsTable({
  definitions,
  loading,
  businessId,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: TaskDefinitionsTableProps) {
  const toast = useToast();

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingField, setTogglingField] = useState<
    'autoCreateTasks' | 'autoCreateReminders' | null
  >(null);

  const handleToggle = async (
    e: React.MouseEvent,
    def: TaskDefinitionListItem,
    field: 'autoCreateTasks' | 'autoCreateReminders'
  ) => {
    e.stopPropagation();
    setTogglingId(def.id);
    setTogglingField(field);

    const nextVal = !def[field];
    try {
      await updateTaskDefinition(businessId, def.id, {
        [field]: nextVal,
      });
      toast.success(
        `${field === 'autoCreateTasks' ? 'Auto Tasks' : 'Auto Reminders'} turned ${nextVal ? 'ON' : 'OFF'}`
      );
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to toggle ${field}`);
    } finally {
      setTogglingId(null);
      setTogglingField(null);
    }
  };

  const columns: GridColumn<TaskDefinitionListItem>[] = useMemo(
    () => [
      {
        headerName: 'Rule',
        field: 'name',
        minWidth: 260,
        flex: 2.5,
        cellRenderer: (p) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center gap-3 py-1">
              <span
                className={`w-11 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${getRuleBadgeClass(
                  p.data.taskType || p.data.name
                )}`}
              >
                {getRuleTypePrefix(p.data.taskType || p.data.name)}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-[var(--primary)] dark:text-slate-100 truncate">
                  {p.data.name || '—'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {getTaskTypeDescription(p.data.taskType, p.data.name)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Schedule',
        field: 'schedulePattern',
        minWidth: 140,
        flex: 1,
        cellRenderer: (p) => <ScheduleBadge pattern={p.data?.schedulePattern} />,
      },
      {
        headerName: 'Auto task',
        colId: 'autoCreateTasks',
        minWidth: 130,
        flex: 1,
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;
          const isToggling = togglingId === row.id && togglingField === 'autoCreateTasks';
          const checked = Boolean(row.autoCreateTasks);

          return (
            <div
              className="flex h-full items-center gap-2 cursor-pointer select-none"
              onClick={(e) => handleToggle(e, row, 'autoCreateTasks')}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <div
                  className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                    checked ? 'bg-[#14224D]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                      checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              )}
              <span
                className={`text-xs font-semibold ${
                  checked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {checked ? 'On' : 'Off'}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Auto reminder',
        colId: 'autoCreateReminders',
        minWidth: 140,
        flex: 1,
        cellRenderer: (p) => {
          const row = p.data;
          if (!row) return null;
          const isToggling = togglingId === row.id && togglingField === 'autoCreateReminders';
          const checked = Boolean(row.autoCreateReminders);

          return (
            <div
              className="flex h-full items-center gap-2 cursor-pointer select-none"
              onClick={(e) => handleToggle(e, row, 'autoCreateReminders')}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <div
                  className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                    checked ? 'bg-[#1e293b]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                      checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              )}
              <span
                className={`text-xs font-semibold ${
                  checked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {checked ? 'On' : 'Off'}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'isActive',
        minWidth: 110,
        flex: 0.9,
        cellRenderer: (p) => {
          const active = Boolean(p.data?.isActive);
          return active ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#059669] dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Inactive
            </span>
          );
        },
      },
      {
        headerName: 'Next due',
        field: 'dueDate',
        minWidth: 160,
        flex: 1.3,
        cellRenderer: (p) => {
          if (!p.data?.dueDate) {
            return <span className="text-xs text-slate-400">—</span>;
          }
          const formatted = formatNextDueDate(p.data.dueDate);
          const diffDays = getDueDifferenceDays(p.data.dueDate);

          return (
            <div className="flex flex-col justify-center py-1 leading-tight">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                {formatted}
              </span>
              {diffDays !== null && (
                <div>
                  {diffDays < 0 ? (
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef2f2] text-[#dc2626] dark:bg-rose-950/40 dark:text-rose-400">
                      {Math.abs(diffDays)} days overdue
                    </span>
                  ) : diffDays <= 7 ? (
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] dark:bg-amber-950/40 dark:text-amber-400">
                      {diffDays === 0 ? 'Due today' : `Due in ${diffDays} days`}
                    </span>
                  ) : (
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eef2ff] text-[#4f46e5] dark:bg-indigo-950/40 dark:text-indigo-400">
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [togglingId, togglingField]
  );

  const actions: GridAction<TaskDefinitionListItem>[] = [
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
      onClick: (row) => onDelete(row.id, row.name),
    },
  ];

  return (
    <CommonDataGrid<TaskDefinitionListItem>
      rowData={definitions}
      columns={columns}
      actions={actions}
      isLoading={loading}
      actionStyle="ghost"
      rowHeight={64}
      onRowClick={(row) => onView(row.id)}
      onRowDoubleClick={(row) => onEdit(row.id)}
      emptyMessage="No task definitions found"
    />
  );
}
