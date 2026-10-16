'use client';

import { useState } from 'react';
import { Plus, X, Eye, Pencil, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

import { TaskListItem } from '@/types/task.types';
import CommonDataGrid, { GridAction, GridColumn } from '@/components/common/CommonTable';
import { useTasks } from '@/hooks/tasks/useTasks';
import { useTaskFilters } from '@/hooks/tasks/useTaskFilters';
import PageFilterBar from '@/components/common/PageFilter';
import TaskFormDialog from '@/components/tasks/TaskFormDialogue';
import ConfirmDialog from '@/components/tasks/ConfirmDialog';
import { updateTask } from '@/services/taskService';
import { TASK_TYPES } from '@/constants/taskConstants';

const columns: GridColumn<TaskListItem>[] = [
  { headerName: 'Title', field: 'title', minWidth: 220, flex: 2, editable: true },
  {
    headerName: 'Client',
    colId: 'client',
    valueGetter: (p) => p.data?.subject?.name ?? '—',
    minWidth: 180,
  },
  {
    headerName: 'Task Type',
    field: 'taskType',
    minWidth: 150,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: TASK_TYPES.map((t) => t.label),
    },
  },
  {
    headerName: 'Status',
    field: 'status',
    minWidth: 140,
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['OPEN', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED'],
    },
  },
  {
    headerName: 'Due Date',
    field: 'dueDate',
    minWidth: 130,
    editable: true,
    valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : '—'),
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

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleView = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingTaskId(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (taskId: string) => {
    setEditingTaskId(taskId);
    setFormDialogOpen(true);
    setDrawerOpen(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-txt-main">Tasks</h1>
            <p className="mt-1 text-sm text-txt-sub">Manage all compliance tasks</p>
          </div>
          <button
            type="button"
            className="btn gap-2 border-none bg-navy text-white hover:bg-navy-hover"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4" />
            Create Task
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

        <PageFilterBar
          type="tasks"
          search={searchQuery}
          onSearchChange={setSearchQuery}
          values={filterValues}
          onChange={onFilterChange}
          onReset={resetFilters}
        />

        {!loading && (
          <p className="text-sm text-txt-sub">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        )}

        <CommonDataGrid<TaskListItem>
          rowData={filteredTasks}
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