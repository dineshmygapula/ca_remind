"use client";

import { useState, useEffect, useMemo } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import ClientsTable from "@/components/clients/ClientsTable";
import ClientsFilter from "@/components/clients/ClientsFilter";
import { getSubjects, deleteSubject } from "@/services/subjectService";
import { SubjectListItem, type ComplianceFilter } from "../../../types/subject";
import ClientDetailsDrawer from "@/components/clients/ClientDetailsDrawer";
import EditClientDialog from "@/components/clients/EditClientDialog";
import CreateSubjectDialog from "@/components/clients/CreateSubjectDialog";

export default function ClientsPage() {
  const { businessId } = useWorkspace();

  // Data state
  const [clients, setClients] = useState<SubjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog / drawer state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL",
  );
  const [gstinFilter, setGstinFilter] = useState<
    "ALL" | "WITH_GST" | "WITHOUT_GST"
  >("ALL");
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>("ALL");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete confirmation and feedback
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    clientId: string;
    clientName: string;
  }>({ open: false, clientId: "", clientName: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Reset pagination when filters change.
  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter, gstinFilter, complianceFilter]);

  const fetchClients = async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError("");
      const data = await getSubjects(businessId);
      setClients(data.filter((subject) => subject.subjectType === "CLIENT"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) fetchClients();
    // fetchClients is intentionally invoked when the workspace business changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.displayName?.toLowerCase().includes(q) ||
          client.email?.toLowerCase().includes(q) ||
          client.phone?.includes(q),
      );
    }

    if (statusFilter === "ACTIVE") {
      result = result.filter((client) => client.isActive);
    }
    if (statusFilter === "INACTIVE") {
      result = result.filter((client) => !client.isActive);
    }

    if (gstinFilter === "WITH_GST") {
      result = result.filter((client) => !!client.gstin);
    }
    if (gstinFilter === "WITHOUT_GST") {
      result = result.filter((client) => !client.gstin);
    }

    if (complianceFilter !== "ALL") {
      result = result.filter((client) =>
        client.activeCompliances?.includes(complianceFilter.toLowerCase()),
      );
    }

    return result;
  }, [clients, searchQuery, statusFilter, gstinFilter, complianceFilter]);

  const paginatedClients = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredClients.slice(start, start + rowsPerPage);
  }, [filteredClients, page, rowsPerPage]);

  const handleView = (clientId: string) => {
    setSelectedClientId(clientId);
    setDrawerOpen(true);
  };

  const handleEdit = (clientId: string) => {
    setEditingClientId(clientId);
    setOpenEditDialog(true);
    setDrawerOpen(false);
  };

  const handleEditSuccess = () => fetchClients();
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedClientId(null);
  };
  const handleCreateSuccess = () => fetchClients();

  const handleDelete = (clientId: string, clientName: string) => {
    setDeleteDialog({ open: true, clientId, clientName });
  };

  const handleDeleteConfirm = async () => {
    if (!businessId) return;

    try {
      setDeleteLoading(true);
      setError("");
      await deleteSubject(businessId, deleteDialog.clientId);
      setDeleteDialog({ open: false, clientId: "", clientName: "" });
      setSnackbar({
        open: true,
        message: "Client deleted successfully",
        severity: "success",
      });
      await fetchClients();
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Failed to delete client",
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!businessId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 py-6">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-base-content">
                Clients
              </h1>
              <p className="mt-1 text-sm text-base-content/70">
                Manage your client information and compliance details
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary gap-2 font-semibold normal-case"
              onClick={() => setOpenCreateDialog(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Client
            </button>
          </header>

          {/* Error banner */}
          {error && (
            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
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
          <ClientsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            gstinFilter={gstinFilter}
            onGstinChange={setGstinFilter}
            complianceFilter={complianceFilter}
            onComplianceChange={setComplianceFilter}
          />

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-base-content/70">
              Showing {filteredClients.length} of {clients.length} clients
            </p>
          )}

          {/* Table */}
          <ClientsTable
            clients={paginatedClients}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            totalCount={filteredClients.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* Existing create/edit/details components remain wired as before */}
      <CreateSubjectDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        businessId={businessId}
        onSuccess={handleCreateSuccess}
      />

      <ClientDetailsDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        clientId={selectedClientId}
        businessId={businessId}
        onEdit={handleEdit}
      />

      <EditClientDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        clientId={editingClientId}
        businessId={businessId}
        onSuccess={handleEditSuccess}
      />

      {/* DaisyUI delete confirmation modal */}
      {deleteDialog.open && (
        <div
          className="modal modal-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-client-title"
        >
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Close delete confirmation"
            disabled={deleteLoading}
            onClick={() =>
              !deleteLoading &&
              setDeleteDialog({ open: false, clientId: "", clientName: "" })
            }
          >
            Close
          </button>

          <div className="modal-box max-w-md rounded-2xl border border-base-300 p-0 shadow-2xl">
            <div className="border-b border-base-300 px-6 py-5">
              <h2
                id="delete-client-title"
                className="text-lg font-bold text-base-content"
              >
                Delete Client
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-5 text-sm leading-6 text-base-content/80">
              Are you sure you want to delete{" "}
              <strong className="font-semibold text-base-content">
                {deleteDialog.clientName}
              </strong>
              ?
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-200/50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  setDeleteDialog({
                    open: false,
                    clientId: "",
                    clientName: "",
                  })
                }
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

      {/* DaisyUI snackbar replacement */}
      {snackbar.open && (
        <div className="toast toast-bottom toast-center z-[100]">
          <div
            role="status"
            className={`alert ${
              snackbar.severity === "success" ? "alert-success" : "alert-error"
            } shadow-lg`}
          >
            <span>{snackbar.message}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              aria-label="Dismiss notification"
              onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
