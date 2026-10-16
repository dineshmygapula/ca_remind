'use client';

import { useState, useMemo } from 'react';
import { Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import CommonDataGrid, { GridAction, GridColumn } from '@/components/common/CommonTable';
import { TaskDefinitionListItem } from '@/types/taskDefinition.types';
import { updateTaskDefinition } from '@/services/taskDefinitionService';
import { useToast } from '@/context/ToastContext';
import { TASK_TYPES } from '@/constants/taskDefinition.constants';

interface TaskDefinitionsTableProps {
  definitions: TaskDefinitionListItem[];
  loading: boolean;
  businessId: string;
  onView: (definitionId: string) => void;
  onEdit: (definitionId: string) => void;
  onDelete: (definitionId: string, name: string) => void;
  onRefresh: () => void;
}

const formatSchedulePattern = (pattern: string) => {
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
      return pattern;
  }
};

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `in ${diffDays} days`;
};

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

  // Tracks toggle in flight
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingField, setTogglingField] = useState<
    'autoCreateTasks' | 'autoCreateReminders' | null
  >(null);

  const handleToggle = async (
    e: React.ChangeEvent<HTMLInputElement>,
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

  const handleUpdateCell = async ({
    row,
    field,
    newValue,
  }: {
    row: TaskDefinitionListItem;
    field: string;
    newValue: any;
    oldValue: any;
  }) => {
    await updateTaskDefinition(businessId, row.id, {
      [field]: newValue,
    });
    onRefresh();
  };

  const columns: GridColumn<TaskDefinitionListItem>[] = useMemo(
    () => [
      {
        headerName: 'Task Name',
        field: 'name',
        minWidth: 220,
        flex: 2,
        editable: true,
      },
      {
        headerName: 'Task Type',
        field: 'taskType',
        minWidth: 150,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: TASK_TYPES.map((t) => t.value),
        },
      },
      {
        headerName: 'Schedule',
        field: 'schedulePattern',
        minWidth: 150,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['monthly', 'quarterly', 'half_yearly', 'yearly', 'one_time'],
        },
        cellRenderer: (p) => {
          const label = formatSchedulePattern(p.data?.schedulePattern ?? '');
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {label}
            </span>
          );
        },
      },
      {
        headerName: 'Auto Tasks',
        colId: 'autoCreateTasks',
        minWidth: 140,
        cellRenderer: (p) => {
          if (!p.data) return null;
          const isToggling = togglingId === p.data.id && togglingField === 'autoCreateTasks';
          const checked = Boolean(p.data.autoCreateTasks);
          return (
            <div
              className="flex h-full items-center gap-2 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
              ) : (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => handleToggle(e, p.data, 'autoCreateTasks')}
                  className="toggle toggle-sm toggle-success"
                  aria-label="Toggle Auto Tasks"
                />
              )}
              <span
                className={`text-[11px] font-bold ${
                  checked ? 'text-emerald-600' : 'text-txt-sub/60'
                }`}
              >
                {checked ? 'ON' : 'OFF'}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Auto Reminders',
        colId: 'autoCreateReminders',
        minWidth: 150,
        cellRenderer: (p) => {
          if (!p.data) return null;
          const isToggling = togglingId === p.data.id && togglingField === 'autoCreateReminders';
          const checked = Boolean(p.data.autoCreateReminders);
          return (
            <div
              className="flex h-full items-center gap-2 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
              ) : (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => handleToggle(e, p.data, 'autoCreateReminders')}
                  className="toggle toggle-sm toggle-success"
                  aria-label="Toggle Auto Reminders"
                />
              )}
              <span
                className={`text-[11px] font-bold ${
                  checked ? 'text-emerald-600' : 'text-txt-sub/60'
                }`}
              >
                {checked ? 'ON' : 'OFF'}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'isActive',
        minWidth: 120,
        cellRenderer: (p) => {
          const active = Boolean(p.data?.isActive);
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {active ? 'Active' : 'Inactive'}
            </span>
          );
        },
      },
      {
        headerName: 'Next Due Date',
        field: 'dueDate',
        minWidth: 160,
        cellRenderer: (p) => {
          if (!p.data?.dueDate) {
            return <span className="text-sm text-txt-sub/50">Not scheduled</span>;
          }
          const dateStr = new Date(p.data.dueDate).toLocaleDateString('en-IN');
          const relativeText = getDaysUntilDue(p.data.dueDate);
          const isOverdue = relativeText.includes('overdue');
          const isToday = relativeText === 'Due today';

          return (
            <div className="flex flex-col justify-center py-1 leading-tight">
              <span className="font-mono text-xs font-semibold text-txt-main">{dateStr}</span>
              <span
                className={`text-[10px] font-medium ${
                  isOverdue ? 'text-red-600 font-bold' : isToday ? 'text-amber-600 font-bold' : 'text-txt-sub'
                }`}
              >
                {relativeText}
              </span>
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
      onRowClick={(row) => onView(row.id)}
      onRowDoubleClick={(row) => onEdit(row.id)}
      onUpdateCell={handleUpdateCell}
      emptyMessage="No task definitions found"
    />
  );
}
