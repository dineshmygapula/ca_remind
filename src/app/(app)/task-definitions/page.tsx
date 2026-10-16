"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X, Plus, AlertTriangle } from "lucide-react";
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
  const [showPastDueOnly, setShowPastDueOnly] = useState(false);

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

  // Derived stats
  const pastDueCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return definitions.filter((d) => {
      if (!d.dueDate) return false;
      const due = new Date(d.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() < today.getTime();
    }).length;
  }, [definitions]);

  const dueThisWeekRules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return definitions.filter((d) => {
      if (!d.dueDate) return false;
      const due = new Date(d.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() >= today.getTime() && due.getTime() <= weekLater.getTime();
    });
  }, [definitions]);

  const fullyAutomatedCount = useMemo(() => {
    return definitions.filter((d) => d.autoCreateTasks && d.autoCreateReminders).length;
  }, [definitions]);

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

    if (scheduleFilter && scheduleFilter !== "ALL") {
      result = result.filter(
        (def) => def.schedulePattern?.toLowerCase() === scheduleFilter.toLowerCase()
      );
    }

    if (autoCreateFilter === "ON") {
      result = result.filter((def) => def.autoCreateTasks === true);
    }
    if (autoCreateFilter === "OFF") {
      result = result.filter((def) => !def.autoCreateTasks);
    }

    if (showPastDueOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter((def) => {
        if (!def.dueDate) return false;
        const due = new Date(def.dueDate);
        due.setHours(0, 0, 0, 0);
        return due.getTime() < today.getTime();
      });
    }

    return result;
  }, [
    definitions,
    searchQuery,
    statusFilter,
    scheduleFilter,
    autoCreateFilter,
    showPastDueOnly,
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

  const handleCreate = () => {
    setDrawerOpen(false);
    setSelectedDefinitionId(null);
    setEditingDefinitionId(null);
    setFormDrawerOpen(true);
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
            <h1 className="text-2xl font-bold tracking-tight text-txt-main">
              Automatic tasks &amp; reminders
            </h1>
            <p className="mt-1 text-sm text-txt-sub">
              Rules that create recurring tasks and reminders for you, on schedule.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 font-semibold px-4 py-2.5 text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-900" />
            <span>New rule</span>
          </button>
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

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total rules */}
          <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
            <span className="text-xs font-medium text-txt-sub">Total rules</span>
            <div className="text-3xl font-bold text-txt-main mt-2 mb-1">
              {definitions.length}
            </div>
            <span className="text-xs text-txt-sub">
              {definitions.length > 0 && definitions.every((d) => d.isActive)
                ? "All active"
                : `${definitions.filter((d) => d.isActive).length} active`}
            </span>
          </div>

          {/* Past due */}
          <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
            <span className="text-xs font-medium text-txt-sub">Past due</span>
            <div
              className={`text-3xl font-bold mt-2 mb-1 ${
                pastDueCount > 0 ? "text-[#dc2626]" : "text-txt-main"
              }`}
            >
              {pastDueCount}
            </div>
            <span className="text-xs text-txt-sub">Need your attention</span>
          </div>

          {/* Due this week */}
          <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
            <span className="text-xs font-medium text-txt-sub">Due this week</span>
            <div className="text-3xl font-bold text-txt-main mt-2 mb-1">
              {dueThisWeekRules.length}
            </div>
            <span className="text-xs text-txt-sub truncate block">
              {dueThisWeekRules[0]?.name || "None"}
            </span>
          </div>

          {/* Fully automated */}
          <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
            <span className="text-xs font-medium text-txt-sub">Fully automated</span>
            <div className="text-3xl font-bold text-[#059669] dark:text-emerald-400 mt-2 mb-1">
              {fullyAutomatedCount} of {definitions.length}
            </div>
            <span className="text-xs text-txt-sub">Task and reminder both on</span>
          </div>
        </div>

        {/* Past Due Alert Banner */}
        {pastDueCount > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50/60 dark:bg-rose-950/20 dark:border-rose-900/40 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-rose-400 shrink-0" />
              <span className="text-sm font-semibold text-red-900 dark:text-rose-200">
                {pastDueCount} rules are past their next due date.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPastDueOnly((prev) => !prev)}
              className="rounded-xl border border-red-300 dark:border-rose-800 bg-surface hover:bg-red-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-red-700 dark:text-rose-300 px-3.5 py-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {showPastDueOnly ? "Show all rules" : "Show past due"}
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
            setShowPastDueOnly(false);
          }}
        />

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-txt-sub">
            Showing {filteredDefinitions.length} of {definitions.length} rules
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
