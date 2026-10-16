"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { TaskDefinitionListItem } from "@/types/taskDefinition.types";
import {
  getTaskDefinitions,
  deleteTaskDefinition,
} from "@/services/taskDefinitionService";
import TaskDefinitionsTable from "@/components/task-definitions/TaskDefinitionsTable";
import TaskDefinitionsFilter from "@/components/task-definitions/TaskDefinitionsFilter";
import TaskDefinitionDetailsDrawer from "@/components/task-definitions/TaskDefinitionDetailsDrawer";
import TaskDefinitionFormDrawer from "@/components/task-definitions/TaskDefinitionFormDrawer";
import ConfirmDialog from "@/components/tasks/ConfirmDialog";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function TaskDefinitionsPage() {
  const { businessId } = useWorkspace();

  // Data state
  const [definitions, setDefinitions] = useState<TaskDefinitionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDefinitionId, setSelectedDefinitionId] = useState<string | null>(null);
  const [drawerRefreshKey, setDrawerRefreshKey] = useState(0);

  // Drawer and dialog state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [editingDefinitionId, setEditingDefinitionId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [scheduleFilter, setScheduleFilter] = useState("");
  const [autoCreateFilter, setAutoCreateFilter] = useState<"ALL" | "ON" | "OFF">("ALL");

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
        err instanceof Error ? err.message : "Failed to load task definitions"
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
          def.taskType?.toLowerCase().includes(q)
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
        err instanceof Error ? err.message : "Failed to delete task definition"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = (definitionId: string) => {
    setFormDrawerOpen(false);
    setEditingDefinitionId(null);
    setSelectedDefinitionId(definitionId);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedDefinitionId(null);
  };

  const handleEdit = (definitionId: string) => {
    setDrawerOpen(false);
    setSelectedDefinitionId(null);
    setEditingDefinitionId(definitionId);
    setFormDrawerOpen(true);
  };

  if (!businessId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-bg">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-txt-main">
              Automatic Task &amp; Reminders
            </h1>
            <p className="mt-1 text-sm text-txt-sub">
              Configure rules to automatically create recurring tasks and reminders
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="alert alert-error flex items-center justify-between text-sm">
            <span>{error}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X className="h-4 w-4" />
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
          onReset={() => {
            setSearchQuery("");
            setStatusFilter("ALL");
            setScheduleFilter("");
            setAutoCreateFilter("ALL");
          }}
        />

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-txt-sub">
            Showing {filteredDefinitions.length} of {definitions.length} definitions
          </p>
        )}

        {/* Table using CommonDataGrid */}
        <TaskDefinitionsTable
          definitions={filteredDefinitions}
          loading={loading}
          businessId={businessId}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onRefresh={fetchDefinitions}
        />

        {/* View Details Drawer */}
        <TaskDefinitionDetailsDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          definitionId={selectedDefinitionId}
          businessId={businessId}
          onEdit={handleEdit}
          onRefresh={fetchDefinitions}
          refreshKey={drawerRefreshKey}
        />

        {/* Unified Right-Side Form Drawer (Edit / Create) */}
        <TaskDefinitionFormDrawer
          open={formDrawerOpen}
          onClose={() => {
            setFormDrawerOpen(false);
            setEditingDefinitionId(null);
          }}
          definitionId={editingDefinitionId}
          businessId={businessId}
          onSuccess={() => {
            fetchDefinitions();
            setFormDrawerOpen(false);
            setEditingDefinitionId(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Task Definition"
          description={
            <>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This
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
