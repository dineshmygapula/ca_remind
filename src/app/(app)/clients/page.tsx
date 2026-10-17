'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import ClientsTable from '@/components/clients/ClientsTable';
import ClientsFilter from '@/components/clients/ClientsFilter';
import { getSubjects, deleteSubject } from '@/services/subjectService';
import { SubjectListItem, type ComplianceFilter } from '@/types/subject';
import ClientDetailsDrawer from '@/components/clients/ClientDetailsDrawer';
import EditClientDialog from '@/components/clients/EditClientDialog';
import CreateSubjectDialog from '@/components/clients/CreateSubjectDialog';
import ConfirmDialog from '@/components/tasks/ConfirmDialog';
import PageSkeleton from '@/components/common/PageSkeleton';
import { useAsyncAction } from '@/hooks/useAnyAction';

export default function ClientsPage() {
  const { businessId } = useWorkspace();

  // Data state
  const [clients, setClients] = useState<SubjectListItem[]>([]);
  const fetchAction = useAsyncAction(true);
  const deleteAction = useAsyncAction();

  const { run: runFetch } = fetchAction;
  const { run: runDelete } = deleteAction;

  // Dialog / drawer state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [gstinFilter, setGstinFilter] = useState<'ALL' | 'WITH_GST' | 'WITHOUT_GST'>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>('ALL');

  // Delete target state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchClients = useCallback(async () => {
    if (!businessId) return;

    await runFetch(() => getSubjects(businessId), {
      errorMessage: 'Failed to load clients',
      showErrorToast: false,
      onSuccess: (data) => {
        setClients(data.filter((subject) => subject.subjectType === 'CLIENT'));
      },
    });
  }, [businessId, runFetch]);

  // Which business we've already started loading. Refs survive Strict Mode's
  // dev-only unmount/remount, so the second effect run is skipped.
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!businessId) return;
    if (loadedFor.current === businessId) return;
    loadedFor.current = businessId;
    setClients([]);
    fetchClients();
  }, [businessId, fetchClients]);

  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.displayName?.toLowerCase().includes(q) ||
          client.businessName?.toLowerCase().includes(q) ||
          client.email?.toLowerCase().includes(q) ||
          client.phone?.includes(q)
      );
    }

    if (statusFilter === 'ACTIVE') {
      result = result.filter((client) => client.isActive);
    }
    if (statusFilter === 'INACTIVE') {
      result = result.filter((client) => !client.isActive);
    }

    if (gstinFilter === 'WITH_GST') {
      result = result.filter((client) => !!client.gstin);
    }
    if (gstinFilter === 'WITHOUT_GST') {
      result = result.filter((client) => !client.gstin);
    }

    if (complianceFilter !== 'ALL') {
      result = result.filter((client) =>
        client.activeCompliances?.includes(complianceFilter.toLowerCase())
      );
    }

    return result;
  }, [clients, searchQuery, statusFilter, gstinFilter, complianceFilter]);

  // Handlers
  const handleView = (clientId: string) => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setEditingClientId(null);
    setSelectedClientId(clientId);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedClientId(null);
    setDrawerOpen(false);
    setOpenEditDialog(false);
    setEditingClientId(null);
    setOpenCreateDialog(true);
  };

  const handleEdit = (clientId: string) => {
    setSelectedClientId(null);
    setDrawerOpen(false);
    setOpenCreateDialog(false);
    setEditingClientId(clientId);
    setOpenEditDialog(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedClientId(null);
  };

  const handleDeleteRequest = (clientId: string, clientName: string) => {
    setDeleteTarget({ id: clientId, name: clientName });
  };

  const handleDeleteConfirm = async () => {
    if (!businessId || !deleteTarget) return;

    await runDelete(() => deleteSubject(businessId, deleteTarget.id), {
      successMessage: `Client "${deleteTarget.name}" deleted successfully`,
      errorMessage: 'Failed to delete client',
      onSuccess: async () => {
        setDeleteTarget(null);
        await fetchClients();
      },
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setGstinFilter('ALL');
    setComplianceFilter('ALL');
  };

  const pageError = fetchAction.error || deleteAction.error;

  if (!businessId || (fetchAction.loading && clients.length === 0)) {
    return <PageSkeleton filterCount={4} />;
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-txt-main">Clients</h1>
            <p className="mt-1 text-sm text-txt-sub">
              Manage your client information and compliance details
            </p>
          </div>

          <button
            type="button"
            className="btn gap-2 border-none bg-navy text-white hover:bg-navy-hover"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>

        {/* Error Alert */}
        {pageError && (
          <div role="alert" className="alert alert-error flex items-center justify-between text-sm">
            <span>{pageError}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Dismiss error"
              onClick={() => {
                fetchAction.clearError();
                deleteAction.clearError();
              }}
            >
              <X className="h-4 w-4" />
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
          onReset={handleResetFilters}
        />

        {/* Results count */}
        {!fetchAction.loading && (
          <p className="text-sm text-txt-sub">
            Showing {filteredClients.length} of {clients.length} clients
          </p>
        )}

        {/* Table using CommonDataGrid */}
        <ClientsTable
          clients={filteredClients}
          loading={fetchAction.loading}
          businessId={businessId}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onRefresh={fetchClients}
        />

        {/* View Details Drawer */}
        <ClientDetailsDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          clientId={selectedClientId}
          businessId={businessId}
          onEdit={handleEdit}
        />

        {/* Create Client Drawer */}
        <CreateSubjectDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          businessId={businessId}
          onSuccess={() => {
            fetchClients();
            setOpenCreateDialog(false);
          }}
        />

        {/* Edit Client Drawer */}
        <EditClientDialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setEditingClientId(null);
          }}
          clientId={editingClientId}
          businessId={businessId}
          onSuccess={() => {
            fetchClients();
            setOpenEditDialog(false);
            setEditingClientId(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Client"
          description={
            <>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </>
          }
          confirmLabel="Delete"
          variant="danger"
          loading={deleteAction.loading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
}
