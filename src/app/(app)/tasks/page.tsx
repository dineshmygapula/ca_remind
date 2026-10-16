'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  X,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

import { TaskListItem } from '@/types/task.types';
import CommonDataGrid, { GridAction, GridColumn } from '@/components/common/CommonTable';
import { useTasks } from '@/hooks/tasks/useTasks';
import { useTaskFilters } from '@/hooks/tasks/useTaskFilters';
import PageFilterBar from '@/components/common/PageFilter';
import TaskFormDialog from '@/components/tasks/TaskFormDialogue';
import TaskDetailsDrawer from '@/components/tasks/TaskDetailsDrawer';
import ConfirmDialog from '@/components/tasks/ConfirmDialog';
import { updateTask } from '@/services/taskService';
import { TASK_TYPES } from '@/constants/taskConstants';

function formatDueDate(val?: string) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return val;
  }
}

function TaskTypeBadge({ type }: { type?: string }) {
  if (!type) return <span className="text-slate-400 text-xs">—</span>;
  const upper = type.toUpperCase();

  if (upper.includes('GST')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#2563eb] dark:bg-blue-950/40 dark:text-blue-300">
        GST
      </span>
    );
  }
  if (upper.includes('TDS')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5f3ff] text-[#7c3aed] dark:bg-purple-950/40 dark:text-purple-300">
        TDS
      </span>
    );
  }
  if (upper.includes('ROC')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfeff] text-[#0891b2] dark:bg-cyan-950/40 dark:text-cyan-300">
        ROC
      </span>
    );
  }
  if (upper.includes('ITR')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-300">
        ITR
      </span>
    );
  }
  if (upper.includes('MSME')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-300">
        MSME
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {type}
    </span>
  );
}

function TaskStatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400 text-xs">—</span>;
  const s = status.toUpperCase();

  if (s === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ecfdf5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5 fill-[#059669] text-white dark:fill-emerald-400 dark:text-slate-900" />
        <span>COMPLETED</span>
      </span>
    );
  }

  if (s === 'OPEN') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff6ff] text-[#2563eb] dark:bg-blue-950/40 dark:text-blue-400">
        <Clock className="h-3.5 w-3.5 text-[#2563eb] dark:text-blue-400" />
        <span>OPEN</span>
      </span>
    );
  }

  if (s === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fffbeb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400">
        <Clock className="h-3.5 w-3.5 text-[#d97706] dark:text-amber-400" />
        <span>IN PROGRESS</span>
      </span>
    );
  }

  if (s === 'CANCELLED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fef2f2] text-[#ef4444] dark:bg-rose-950/40 dark:text-rose-400">
        <XCircle className="h-3.5 w-3.5 text-[#ef4444] dark:text-rose-400" />
        <span>CANCELLED</span>
      </span>
    );
  }

  if (s === 'CLOSED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
        <span>CLOSED</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <Clock className="h-3.5 w-3.5 text-slate-500" />
      <span>{s}</span>
    </span>
  );
}

const columns: GridColumn<TaskListItem>[] = [
  {
    headerName: 'Title',
    field: 'title',
    minWidth: 220,
    flex: 2,
    editable: true,
    cellRenderer: (p) => (
      <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
        {p.value || '—'}
      </span>
    ),
  },
  {
    headerName: 'Client',
    colId: 'client',
    valueGetter: (p) => p.data?.subject?.name ?? '—',
    minWidth: 160,
    flex: 1.2,
    cellRenderer: (p) => (
      <span className="text-slate-700 dark:text-slate-300 text-sm font-normal">
        {p.value || '—'}
      </span>
    ),
  },
  {
    headerName: 'Task Type',
    field: 'taskType',
    minWidth: 140,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: TASK_TYPES.map((t) => t.label),
    },
    cellRenderer: (p) => <TaskTypeBadge type={p.value} />,
  },
  {
    headerName: 'Status',
    field: 'status',
    minWidth: 150,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['OPEN', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED'],
    },
    cellRenderer: (p) => <TaskStatusBadge status={p.value} />,
  },
  {
    headerName: 'Due Date',
    field: 'dueDate',
    minWidth: 150,
    editable: true,
    cellRenderer: (p) => {
      if (!p.value) return <span className="text-slate-400 text-sm">—</span>;
      return (
        <div className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-normal">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <span>{formatDueDate(p.value)}</span>
        </div>
      );
    },
  },
];

export default function TasksPage() {
  // Private layout guarantees status === 'ready', so businessId is always set
  const { businessId } = useWorkspace();

  const { tasks, loading, error, setError, refetch, removeTask, deleteLoading } =
    useTasks(businessId!);

  const {
    searchQuery,
    setSearchQuery,
    values: filterValues,
    onChange: onFilterChange,
    filteredTasks,
    reset: resetFilters,
  } = useTaskFilters(tasks);

  const [sortBy, setSortBy] = useState<'due_asc' | 'due_desc' | 'title_asc' | 'client_asc'>('due_asc');
  const [sortOpen, setSortOpen] = useState(false);

  const sortLabels: Record<'due_asc' | 'due_desc' | 'title_asc' | 'client_asc', string> = {
    due_asc: 'Sort by due date',
    due_desc: 'Sort by due date (Latest)',
    title_asc: 'Sort by title (A-Z)',
    client_asc: 'Sort by client (A-Z)',
  };

  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    list.sort((a, b) => {
      if (sortBy === 'due_asc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'due_desc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'client_asc') {
        return (a.subject?.name || '').localeCompare(b.subject?.name || '');
      }
      return 0;
    });
    return list;
  }, [filteredTasks, sortBy]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleView = (taskId: string) => {
    setFormDialogOpen(false);
    setEditingTaskId(null);
    setSelectedTaskId(taskId);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedTaskId(null);
    setDrawerOpen(false);
    setEditingTaskId(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (taskId: string) => {
    setSelectedTaskId(null);
    setDrawerOpen(false);
    setEditingTaskId(taskId);
    setFormDialogOpen(true);
  };

  const closeForm = () => {
    setFormDialogOpen(false);
    setEditingTaskId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await removeTask(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error is captured in `error` state by useTasks; dialog stays open for retry/cancel
    }
  };

  const actions: GridAction<TaskListItem>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      variant: 'primary',
      onClick: (row) => handleView(row.id),
    },
    {
      label: 'Edit',
      icon: <Pencil className="h-4 w-4" />,
      variant: 'secondary',
      onClick: (row) => handleEdit(row.id),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger',
      onClick: (row) => setDeleteTarget({ id: row.id, title: row.title }),
    },
  ];

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-txt-main">Tasks</h1>
            <p className="mt-1 text-sm text-txt-sub">Manage all compliance tasks</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-navy hover:bg-navy-hover px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4" />
            <span>Create task</span>
          </button>
        </div>

        {error && (
          <div role="alert" className="alert alert-error flex items-center justify-between text-sm">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <PageFilterBar
          type="tasks"
          search={searchQuery}
          onSearchChange={setSearchQuery}
          values={filterValues}
          onChange={onFilterChange}
          onReset={resetFilters}
        />

        {/* Counts & Sort Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-txt-main">
              {sortedTasks.length}
            </span>
            <span className="text-base font-normal text-txt-sub">
              tasks
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-divider bg-surface px-3.5 py-1.5 text-sm font-medium text-txt-main hover:bg-bg transition-colors shadow-xs cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-txt-sub" />
              <span>{sortLabels[sortBy]}</span>
              <ChevronDown className="h-4 w-4 text-txt-sub" />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 mt-1 w-56 rounded-xl border border-divider bg-surface p-1 shadow-lg z-20 text-sm">
                  {(['due_asc', 'due_desc', 'title_asc', 'client_asc'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSortBy(key);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        sortBy === key
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                          : 'text-txt-main hover:bg-bg'
                      }`}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table using CommonDataGrid */}
        <CommonDataGrid<TaskListItem>
          rowData={sortedTasks}
          columns={columns}
          actions={actions}
          isLoading={loading}
          onRowClick={(row) => handleView(row.id)}
          onRowDoubleClick={(row) => handleEdit(row.id)}
          onUpdateCell={async ({ row, field, newValue }) => {
            if (!businessId) return;
            let valueToSave = newValue;
            if (field === 'taskType') {
              const matched = TASK_TYPES.find(
                (t) => t.label === newValue || t.value === newValue || t.apiValue === newValue
              );
              if (matched) valueToSave = matched.apiValue;
            }
            await updateTask(businessId, row.id, { [field]: valueToSave });
            refetch();
          }}
          emptyMessage="No tasks found"
        />

        <TaskDetailsDrawer
          open={drawerOpen}
          taskId={selectedTaskId}
          businessId={businessId!}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedTaskId(null);
          }}
          onEdit={handleEdit}
          onRefresh={refetch}
        />

        <TaskFormDialog
          open={formDialogOpen}
          taskId={editingTaskId ?? undefined}
          businessId={businessId!}
          onClose={closeForm}
          onSuccess={() => {
            refetch();
            closeForm();
          }}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Task"
          description={
            <>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This
              action cannot be undone.
            </>
          }
          confirmLabel="Delete"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
}