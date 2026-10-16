"use client";

import { useMemo } from "react";
import { Eye, Pencil, Trash2, Calendar } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { TaskListItem } from "@/types/task.types";
import CommonDataGrid, { GridAction, GridColumn } from "@/components/common/CommonTable";
import PageFilterBar from "@/components/common/PageFilter";
import ResourcePageLayout from "@/components/common/ResourcePageLayout";
import TaskFormDialog from "@/components/tasks/TaskFormDialogue";
import TaskDetailsDrawer from "@/components/tasks/TaskDetailsDrawer";
import ConfirmDialog from "@/components/tasks/ConfirmDialog";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useTaskFilters } from "@/hooks/tasks/useTaskFilters";

import { updateTask } from "@/services/taskService";
import { TASK_TYPES } from "@/constants/taskConstants";
import { compareDates, compareStrings, SortOption, useSortedItems } from "@/hooks/useSortedItems";
import { useResourcePageState } from "@/hooks/useResourcePageState";
import { useAsyncAction } from "@/hooks/useAnyAction";
import { formatDueDate } from "@/utils/formatDate";
import { TaskStatusBadge, TaskTypeBadge } from "@/components/tasks/TaskBadges";

const STATUS_VALUES = ["OPEN", "PENDING", "IN_PROGRESS", "COMPLETED", "CLOSED", "CANCELLED"];

const SORT_OPTIONS: SortOption<TaskListItem>[] = [
  { key: "due_asc", label: "Sort by due date", compare: compareDates((t) => t.dueDate, "asc") },
  { key: "due_desc", label: "Sort by due date (Latest)", compare: compareDates((t) => t.dueDate, "desc") },
  { key: "title_asc", label: "Sort by title (A-Z)", compare: compareStrings((t) => t.title) },
  { key: "client_asc", label: "Sort by client (A-Z)", compare: compareStrings((t) => t.subject?.name) },
];

const columns: GridColumn<TaskListItem>[] = [
  {
    headerName: "Title",
    field: "title",
    minWidth: 220,
    flex: 2,
    editable: true,
    cellRenderer: (p) => (
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.value || "—"}</span>
    ),
  },
  {
    headerName: "Client",
    colId: "client",
    valueGetter: (p) => p.data?.subject?.name ?? "—",
    minWidth: 160,
    flex: 1.2,
    cellRenderer: (p) => (
      <span className="text-sm font-normal text-slate-700 dark:text-slate-300">{p.value || "—"}</span>
    ),
  },
  {
    headerName: "Task Type",
    field: "taskType",
    minWidth: 140,
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: TASK_TYPES.map((t) => t.label) },
    cellRenderer: (p) => <TaskTypeBadge type={p.value} />,
  },
  {
    headerName: "Status",
    field: "status",
    minWidth: 150,
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: STATUS_VALUES },
    cellRenderer: (p) => <TaskStatusBadge status={p.value} />,
  },
  {
    headerName: "Due Date",
    field: "dueDate",
    minWidth: 150,
    editable: true,
    cellRenderer: (p) =>
      p.value ? (
        <div className="inline-flex items-center gap-2 text-sm font-normal text-slate-700 dark:text-slate-300">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          <span>{formatDueDate(p.value)}</span>
        </div>
      ) : (
        <span className="text-sm text-slate-400">—</span>
      ),
  },
];

export default function TasksPage() {
  const { businessId } = useWorkspace();
  const id = businessId!;

  const { tasks, loading, error, setError, refetch, removeTask } = useTasks(id);
  const filters = useTaskFilters(tasks);
  const { sorted, sortProps } = useSortedItems(filters.filteredTasks, SORT_OPTIONS);

  const page = useResourcePageState();
  const deleteAction = useAsyncAction();

  const handleDeleteConfirm = async () => {
    const target = page.deleteTarget;
    if (!target) return;
    await deleteAction.run(() => removeTask(target.id), {
      successMessage: `"${target.label}" deleted`,
      errorMessage: "Failed to delete task",
      onSuccess: page.cancelDelete,
    });
  };

  const handleUpdateCell = async ({
    row,
    field,
    newValue,
  }: {
    row: TaskListItem;
    field: string;
    newValue: unknown;
  }) => {
    let value = newValue;
    if (field === "taskType") {
      const matched = TASK_TYPES.find(
        (t) => t.label === newValue || t.value === newValue || t.apiValue === newValue
      );
      if (matched) value = matched.apiValue;
    }
    await updateTask(id, row.id, { [field]: value });
    refetch();
  };

  const actions = useMemo<GridAction<TaskListItem>[]>(
    () => [
      { label: "View", icon: <Eye className="h-4 w-4" />, variant: "primary", onClick: (r) => page.openView(r.id) },
      { label: "Edit", icon: <Pencil className="h-4 w-4" />, variant: "secondary", onClick: (r) => page.openEdit(r.id) },
      { label: "Delete", icon: <Trash2 className="h-4 w-4" />, variant: "danger", onClick: (r) => page.requestDelete(r.id, r.title) },
    ],
    [page.openView, page.openEdit, page.requestDelete]
  );

  return (
    <ResourcePageLayout
      title="Tasks"
      description="Manage all compliance tasks"
      actionLabel="Create task"
      onAction={page.openCreate}
      error={error}
      onDismissError={() => setError("")}
      filters={
        <PageFilterBar
          type="tasks"
          search={filters.searchQuery}
          onSearchChange={filters.setSearchQuery}
          values={filters.values}
          onChange={filters.onChange}
          onReset={filters.reset}
        />
      }
      summary={
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-txt-main">{sorted.length}</span>
          <span className="text-base font-normal text-txt-sub">tasks</span>
        </div>
      }
      sort={sortProps}
      overlays={
        <>
          <TaskDetailsDrawer
            open={page.viewOpen}
            taskId={page.viewId}
            businessId={id}
            onClose={page.close}
            onEdit={page.openEdit}
            onRefresh={refetch}
          />
          <TaskFormDialog
            open={page.formOpen}
            taskId={page.formId ?? undefined}
            businessId={id}
            onClose={page.close}
            onSuccess={() => {
              refetch();
              page.close();
            }}
          />
          <ConfirmDialog
            open={!!page.deleteTarget}
            title="Delete Task"
            description={
              <>
                Are you sure you want to delete <strong>{page.deleteTarget?.label}</strong>? This
                action cannot be undone.
              </>
            }
            confirmLabel="Delete"
            variant="danger"
            loading={deleteAction.loading}
            onConfirm={handleDeleteConfirm}
            onCancel={page.cancelDelete}
          />
        </>
      }
    >
      <CommonDataGrid<TaskListItem>
        rowData={sorted}
        columns={columns}
        actions={actions}
        isLoading={loading}
        onRowClick={(row) => page.openView(row.id)}
        onRowDoubleClick={(row) => page.openEdit(row.id)}
        onUpdateCell={handleUpdateCell}
        emptyMessage="No tasks found"
      />
    </ResourcePageLayout>
  );
}