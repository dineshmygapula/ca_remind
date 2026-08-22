"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
//import { Add as AddIcon } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { TaskDefinitionListItem } from "../../../types/taskDefinition.types";
import {
  getTaskDefinitions,
  deleteTaskDefinition,
} from "@/services/taskDefinitionService";
//import AddTaskDefinitionDialog from "../../../components/task-definitions/CreateTaskDefinitionDialog";
import TaskDefinitionsTable from "@/components/task-definitions/TaskDefinitionsTable";
import TaskDefinitionsFilter from "@/components/task-definitions/TaskDefinitionsFilter";
import TaskDefinitionDetailsDrawer from "@/components/task-definitions/TaskDefinitionDetailsDrawer";
import EditTaskDefinitionDialog from "@/components/task-definitions/EditTaskDefinitionDialog";

export default function TaskDefinitionsPage() {
  const { businessId } = useAuth();

  // ─── Data State ──────────────────────────────────────────────────────────
  const [definitions, setDefinitions] = useState<TaskDefinitionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDefinitionId, setSelectedDefinitionId] = useState<
    string | null
  >(null);
  const [drawerRefreshKey, setDrawerRefreshKey] = useState(0); // ✅ NEW

  // ─── Dialog State ────────────────────────────────────────────────────────
 // const [openCreateDialog, setOpenCreateDialog] = useState(false);
  // Add after existing dialog state
  /* const [selectedDefinitionId, setSelectedDefinitionId] = useState<
    string | null
  >(null); */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Filter State ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [scheduleFilter, setScheduleFilter] = useState<string>("");
  const [autoCreateFilter, setAutoCreateFilter] = useState<
    "ALL" | "ON" | "OFF"
  >("ALL"); // ✅ NEW
  // Add after existing state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingDefinitionId, setEditingDefinitionId] = useState<string | null>(
    null,
  );

  // ─── Fetch Definitions ───────────────────────────────────────────────────
  useEffect(() => {
    if (businessId) fetchDefinitions();
  }, [businessId]);

  const fetchDefinitions = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getTaskDefinitions(businessId);
      setDefinitions(data);
      setDrawerRefreshKey((prev) => prev + 1); // ✅ NEW — signal drawer to re-fetch
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

  // ─── Filtered Definitions ────────────────────────────────────────────────
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

    if (statusFilter === "ACTIVE")
      result = result.filter((def) => def.isActive);
    if (statusFilter === "INACTIVE")
      result = result.filter((def) => !def.isActive);

    if (scheduleFilter) {
      result = result.filter((def) => def.schedulePattern === scheduleFilter);
    }

    // ✅ NEW
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

  // ─── Handlers ────────────────────────────────────────────────────────────
  // Keep or remove handleDelete — but add this:
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
  /* const handleCreateSuccess = () => {
    fetchDefinitions();
  }; */
  // Add handler
  const handleView = (definitionId: string) => {
    setSelectedDefinitionId(definitionId);
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedDefinitionId(null);
  };

  // Handler (should already be there)
  const handleEdit = (definitionId: string) => {
    setEditingDefinitionId(definitionId);
    setOpenEditDialog(true);
    setDrawerOpen(false);
  };
  // ─── Loading Guard ───────────────────────────────────────────────────────
  if (!businessId) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" fontWeight={600}>
               Automatic Task & Reminders...
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
               Configure rules to atomatically create recurring tasks and reminders

                
              </Typography>
            </Box>
            {/* <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Create Definition
            </Button> */}
            
          </Stack>

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <TaskDefinitionsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            scheduleFilter={scheduleFilter}
            onScheduleChange={setScheduleFilter}
            autoCreateFilter={autoCreateFilter} // ✅ NEW
            onAutoCreateChange={setAutoCreateFilter} // ✅ NEW
          />

          {/* Results Count */}
          {!loading && (
            <Typography variant="body2" color="text.secondary">
              Showing {filteredDefinitions.length} of {definitions.length}{" "}
              definitions
            </Typography>
          )}

          {/* Table */}
          <TaskDefinitionsTable
            definitions={filteredDefinitions}
            loading={loading}
            businessId={businessId} // ✅ ADD
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onRefresh={fetchDefinitions} // ✅ ADD
          />

          {/* Create Dialog */}
          {/* <AddTaskDefinitionDialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            businessId={businessId}
            onSuccess={handleCreateSuccess}
          />
 */}
          <TaskDefinitionDetailsDrawer
            open={drawerOpen}
            onClose={handleDrawerClose}
            definitionId={selectedDefinitionId}
            businessId={businessId}
            onEdit={handleEdit}
            onRefresh={fetchDefinitions}
            refreshKey={drawerRefreshKey} // ✅ NEW
          />

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

          {/* ── Delete Confirmation Dialog ── */}
<Dialog
  open={!!deleteTarget}
  onClose={() => !deleteLoading && setDeleteTarget(null)}
  maxWidth="xs"
  fullWidth
  PaperProps={{ sx: { borderRadius: 3, padding: "0 !important", overflow: "hidden" } }}
>
  <DialogTitle
    sx={{
      px: 3,
      pt: 2.5,
      pb: 2,
      borderBottom: "1px solid #F0F0F0",
      backgroundColor: "#fff",
      color: "#0F172A",
      fontWeight: 700,
      fontSize: "1rem",
    }}
  >
    Delete Task Definition
  </DialogTitle>
  <DialogContent sx={{ px: 3, pt: 2.5 }}>
    <DialogContentText>
      Are you sure you want to delete{" "}
      <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
    <Button
      variant="outlined"
      onClick={() => setDeleteTarget(null)}
      disabled={deleteLoading}
      sx={{ flex: 1 }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      color="error"
      onClick={handleDeleteConfirm}
      disabled={deleteLoading}
      sx={{ flex: 1 }}
    >
      {deleteLoading ? <CircularProgress size={18} color="inherit" /> : "Delete"}
    </Button>
  </DialogActions>
</Dialog>
        </Stack>
      </Container>
    </Box>
  );
}
