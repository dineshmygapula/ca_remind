'use client';

import { useState } from 'react';
import { Plus, X, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';



import { TaskListItem } from '@/types/task.types';
import CommonDataGrid, { GridAction, GridColumn } from '@/components/common/CommonTable';
import { useTasks } from '@/hooks/tasks/useTasks';
import { useTaskFilters } from '@/hooks/tasks/useTaskFilters';
import PageFilterBar from '@/components/common/PageFilter';
import TaskFormDialog from '@/components/tasks/TaskFormDialogue';
import ConfirmDialog from '@/components/tasks/ConfirmDialog';

// Column definitions live at module scope — they don't depend on component
// state, so there's no reason to rebuild them (or wrap them in useMemo) on
// every render.
const columns: GridColumn<TaskListItem>[] = [
  { headerName: 'Title', field: 'title', minWidth: 220, flex: 2 },
  {
    headerName: 'Client',
    colId: 'client',
    valueGetter: (p) => p.data?.subject?.name ?? '—',
    minWidth: 180,
  },
  { headerName: 'Task Type', field: 'taskType', minWidth: 130 },
  { headerName: 'Status', field: 'status', minWidth: 140 },
  {
    headerName: 'Due Date',
    field: 'dueDate',
    minWidth: 130,
    valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : '—'),
  },
];

export default function TasksPage() {
  const { businessId } = useAuth();

  // ─── Data + CRUD ──────────────────────────────────────────────────────────
  const { tasks, loading, error, setError, refetch, removeTask, deleteLoading } =
    useTasks(businessId);

  // ─── Filters ─────────────────────────────────────────────────────────────
  const {
    searchQuery,
    setSearchQuery,
    values: filterValues,
    onChange: onFilterChange,
    filteredTasks,
    reset: resetFilters,
  } = useTaskFilters(tasks);

  // ─── Dialog / drawer UI state (page-local, not data) ───────────────────────
  // One dialog handles both create and edit — `editingTaskId` set means edit
  // mode, `formDialogOpen` alone (editingTaskId null) means create mode.
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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await removeTask(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error is already captured in `error` state by useTasks — dialog
      // stays open so the user can see it and retry or cancel.
    }
  };

  const actions: GridAction<TaskListItem>[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, variant: 'secondary', onClick: (row) => handleView(row.id) },
    { label: 'Edit', icon: <Pencil className="h-4 w-4" />, variant: 'primary', onClick: (row) => handleEdit(row.id) },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger',
      onClick: (row) => setDeleteTarget({ id: row.id, title: row.title }),
    },
  ];

  if (!businessId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-navy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Header */}
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

        {/* Error */}
        {error && (
          <div className="alert alert-error flex items-center justify-between text-sm">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <PageFilterBar
          type="tasks"
          search={searchQuery}
          onSearchChange={setSearchQuery}
          values={filterValues}
          onChange={onFilterChange}
          onReset={resetFilters}
        />

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-txt-sub">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        )}

        {/* Grid — AG Grid handles its own pagination, so no separate
            usePagination/page-slicing is needed here anymore. */}
        <CommonDataGrid<TaskListItem>
          rowData={filteredTasks}
          columns={columns}
          actions={actions}
          isLoading={loading}
          onRowClick={(row) => handleView(row.id)}
          emptyMessage="No tasks found"
        />

        {/* Create / Edit Dialog — same component, driven by editingTaskId */}
        <TaskFormDialog
          open={formDialogOpen}
          taskId={editingTaskId ?? undefined}
          businessId={businessId}
          onClose={() => {
            setFormDialogOpen(false);
            setEditingTaskId(null);
          }}
          onSuccess={() => {
            refetch();
            setFormDialogOpen(false);
            setEditingTaskId(null);
          }}
        />

        {/* Details Drawer */}


        {/* Delete Confirmation */}
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