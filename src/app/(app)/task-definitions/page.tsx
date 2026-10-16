"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { TaskDefinitionListItem } from "../../../types/taskDefinition.types";
import {
  getTaskDefinitions,
  deleteTaskDefinition,
} from "@/services/taskDefinitionService";
import TaskDefinitionsTable from "@/components/task-definitions/TaskDefinitionsTable";
import TaskDefinitionsFilter from "@/components/task-definitions/TaskDefinitionsFilter";
import TaskDefinitionDetailsDrawer from "@/components/task-definitions/TaskDefinitionDetailsDrawer";
import EditTaskDefinitionDialog from "@/components/task-definitions/EditTaskDefinitionDialog";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function TaskDefinitionsPage() {
  const { businessId } = useWorkspace();

  // Data state
  const [definitions, setDefinitions] = useState<TaskDefinitionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(
    null,
  );
  const [drawerRefreshKey, setDrawerRefreshKey] = useState(0);

  // Drawer and dialog state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL",
  );
  const [scheduleFilter, setScheduleFilter] = useState("");
  const [autoCreateFilter, setAutoCreateFilter] = useState<"ALL" | "ON" | "OFF">(
    "ALL",
  );
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingDefinitionId, setEditingDefinitionId] = useState<string | null>(
    null,
  );

  const fetchDefinitions = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError("");
      const data = await getTaskDefinitions(businessId);
      setDefinitions(data);
      setDrawerRefreshKey((prev) => prev + 1);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load task definitions",
      );
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) fetchDefinitions();
  }, [businessId, fetchDefinitions]);

  const filteredDefinitions = useMemo(() => {
    let result = [...definitions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (def) =>
          def.name?.toLowerCase().includes(q) ||
          def.taskType?.toLowerCase().includes(q),
      );
    }

    if (statusFilter === "ACTIVE") {
      result = result.filter((def) => def.isActive);
    }
    if (statusFilter === "INACTIVE") {
      result = result.filter((def) => !def.isActive);
    }

    if (scheduleFilter) {
      result = result.filter((def) => def.schedulePattern === scheduleFilter);
    }

    if (autoCreateFilter === "ON") {
      result = result.filter((def) => def.autoCreateTasks === true);
    }
    if (autoCreateFilter === "OFF") {
      result = result.filter((def) => !def.autoCreateTasks);
    }

    return result;
  }, [
    definitions,
    searchQuery,
    statusFilter,
    scheduleFilter,
    autoCreateFilter,
  ]);

  const handleDeleteRequest = (definitionId: string, name: string) => {
    setDeleteTarget({ id: definitionId, name });
  };

  const handleDeleteConfirm = async () => {
    if (!businessId || !deleteTarget) return;

    try {
      setDeleteLoading(true);
      setError("");
      await deleteTaskDefinition(businessId, deleteTarget.id);
      setDeleteTarget(null);
      await fetchDefinitions();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete task definition",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = (definitionId: string) => {
    setSelectedDefinitionId(definitionId);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedDefinitionId(null);
  };

  const handleEdit = (definitionId: string) => {
    setEditingDefinitionId(definitionId);
    setOpenEditDialog(true);
    setDrawerOpen(false);
  };

  if (!businessId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 py-8">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-base-content">
                Automatic Task &amp; Reminders
              </h1>
              <p className="mt-1 text-sm text-base-content/70">
                Configure rules to automatically create recurring tasks and reminders.
              </p>
            </div>
          </header>

          {/* Error */}
          {error && (
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v3m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                />
              </svg>
              <span>{error}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                ✕
              </button>
            </div>
          )}

          {/* Filters */}
          <TaskDefinitionsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            scheduleFilter={scheduleFilter}
            onScheduleChange={setScheduleFilter}
            autoCreateFilter={autoCreateFilter}
            onAutoCreateChange={setAutoCreateFilter}
          />

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-base-content/70">
              Showing {filteredDefinitions.length} of {definitions.length} definitions
            </p>
          )}

          {/* Table */}
          <TaskDefinitionsTable
            definitions={filteredDefinitions}
            loading={loading}
            businessId={businessId}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onRefresh={fetchDefinitions}
          />

          {/* Existing details drawer */}
          <TaskDefinitionDetailsDrawer
            open={drawerOpen}
            onClose={handleDrawerClose}
            definitionId={selectedDefinitionId}
            businessId={businessId}
            onEdit={handleEdit}
            onRefresh={fetchDefinitions}
            refreshKey={drawerRefreshKey}
          />

          {/* Existing edit flow */}
          <EditTaskDefinitionDialog
            open={openEditDialog}
            onClose={() => setOpenEditDialog(false)}
            definitionId={editingDefinitionId}
            businessId={businessId}
            onSuccess={() => {
              fetchDefinitions();
              setOpenEditDialog(false);
            }}
          />

          {/* DaisyUI delete confirmation modal */}
          {deleteTarget && (
            <div
              className="modal modal-open"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-definition-title"
            >
              <button
                type="button"
                className="modal-backdrop"
                aria-label="Close delete confirmation"
                disabled={deleteLoading}
                onClick={() => !deleteLoading && setDeleteTarget(null)}
              >
                Close
              </button>

              <div className="modal-box max-w-md rounded-2xl border border-base-300 p-0 shadow-2xl">
                <div className="border-b border-base-300 px-6 py-5">
                  <h2
                    id="delete-definition-title"
                    className="text-lg font-bold text-base-content"
                  >
                    Delete Task Definition
                  </h2>
                  <p className="mt-1 text-sm text-base-content/60">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="px-6 py-5 text-sm leading-6 text-base-content/80">
                  Are you sure you want to delete{" "}
                  <strong className="font-semibold text-base-content">
                    {deleteTarget.name}
                  </strong>
                  ?
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-200/50 px-6 py-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-error text-white"
                    onClick={handleDeleteConfirm}
                    disabled={deleteLoading}
                  >
                    {deleteLoading && (
                      <span className="loading loading-spinner loading-sm" />
                    )}
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
