'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar,
  Box, Container, Stack, Typography,
  Button, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '@/context/AuthContext';

import ClientsTable from '@/components/clients/ClientsTable';
import ClientsFilter from '@/components/clients/ClientsFilter';
import { getSubjects, deleteSubject } from '@/services/subjectService';
import { SubjectListItem } from '../../../types/subject';  // ✅ Fixed path
import ClientDetailsDrawer from '@/components/clients/ClientDetailsDrawer';
import EditClientDialog from '@/components/clients/EditClientDialog';
//import CreateClientDialog from '@/components/clients/CreateClientDialog';

//import AdddClientDialog from '../../../components/clients/add/AddClientDialog';  // ✅ Fixed name and path
import { 
  
  type ComplianceFilter,  // ✅ import this
} from '@/types/subject';

import CreateSubjectDialog from '@/components/clients/CreateSubjectDialog';
export default function ClientsPage() {
  const { businessId } = useAuth();

  // ─── Data State ──────────────────────────────────────────────────────────────
  const [clients, setClients] = useState<SubjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Dialog / Drawer State ───────────────────────────────────────────────────
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ─── Filter State ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [gstinFilter, setGstinFilter] = useState<'ALL' | 'WITH_GST' | 'WITHOUT_GST'>('ALL');

  const [complianceFilter, setComplianceFilter] = useState<ComplianceFilter>('ALL');

  //Pagination status

  const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);


  // ─── Delete Confirmation ─────────────────────────────
const [deleteDialog, setDeleteDialog] = useState<{
  open: boolean;
  clientId: string;
  clientName: string;
}>({ open: false, clientId: '', clientName: '' });
const [deleteLoading, setDeleteLoading] = useState(false);
const [snackbar, setSnackbar] = useState<{
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}>({ open: false, message: '', severity: 'success' });
  
  
  // ─── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (businessId) fetchClients();
  }, [businessId]);

   // Add this useEffect
useEffect(() => {
  setPage(0);
}, [searchQuery, statusFilter, gstinFilter, complianceFilter]);

  const fetchClients = async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getSubjects(businessId);
      setClients(data.filter(s => s.subjectType === 'CLIENT'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // ─── Available Teams ─────────────────────────────────────────────────────────
 
 
  
  

  // ─── Filtered Clients ────────────────────────────────────────────────────────
  // ✅ Fix — add compliance filter + remove assignedTeamFilter
const filteredClients = useMemo(() => {
  let result = [...clients];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(c =>
      c.displayName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }
    if (statusFilter === 'ACTIVE') result = result.filter(c => c.isActive);
    if (statusFilter === 'INACTIVE') result = result.filter(c => !c.isActive);

    if (gstinFilter === 'WITH_GST') result = result.filter(c => !!c.gstin);
    if (gstinFilter === 'WITHOUT_GST') result = result.filter(c => !c.gstin);

   // ✅ ADD — compliance filter
  if (complianceFilter !== 'ALL') {
    result = result.filter(c =>
      c.activeCompliances?.includes(complianceFilter.toLowerCase())
    );
  }

  return result;
}, [clients, searchQuery, statusFilter, gstinFilter, complianceFilter]); // ✅ updated deps

  
  // ─── Paginated slice ──────────────────────────────────
const paginatedClients = useMemo(() => {
  const start = page * rowsPerPage;
  return filteredClients.slice(start, start + rowsPerPage);
}, [filteredClients, page, rowsPerPage]);
  // ─── Handlers ────────────────────────────────────────────────────────────────
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
  const handleDrawerClose = () => { setDrawerOpen(false); setSelectedClientId(null); };
  const handleCreateSuccess = () => fetchClients();

 /*  const handleDelete = async (clientId: string, clientName: string) => {
    if (!businessId) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${clientName}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      setError('');
      await deleteSubject(businessId, clientId);
      await fetchClients();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    }
  }; */

  const handleDelete = (clientId: string, clientName: string) => {
  setDeleteDialog({ open: true, clientId, clientName });
};

const handleDeleteConfirm = async () => {
  if (!businessId) return;
  try {
    setDeleteLoading(true);
    await deleteSubject(businessId, deleteDialog.clientId);
    setDeleteDialog({ open: false, clientId: '', clientName: '' });
    setSnackbar({ open: true, message: 'Client deleted successfully', severity: 'success' });
    await fetchClients();
  } catch (err: unknown) {
    setSnackbar({
      open: true,
      message: err instanceof Error ? err.message : 'Failed to delete client',
      severity: 'error',
    });
  } finally {
    setDeleteLoading(false);
  }
};

  // ─── Loading Guard ───────────────────────────────────────────────────────────
  if (!businessId) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        bgcolor: 'background.default',
      }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh',py: 1 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>

          {/* ── Header ── */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Clients
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage your client information and compliance details
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Add Client
            </Button>
          </Stack>

          {/* ── Error ── */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* ── Filters ── */}
          <ClientsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            gstinFilter={gstinFilter}
            onGstinChange={setGstinFilter}
           complianceFilter={complianceFilter}          // ✅ state value
  onComplianceChange={setComplianceFilter}     // ✅ setter
          />

          {/* ── Results Count ── */}
          {!loading && (
            <Typography variant="body2" color="text.secondary">
              Showing {filteredClients.length} of {clients.length} clients
            </Typography>
          )}

          {/* ── Table ── */}
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
  onRowsPerPageChange={(e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }}
/>
          {/* ── Dialogs & Drawer ── */}
           {/*  <CreateClientDialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            businessId={businessId}
            onSuccess={handleCreateSuccess}
          /> */}

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

        </Stack>
      </Container>

      {/* ── Delete Confirmation Dialog ── */}
<Dialog
  open={deleteDialog.open}
  onClose={() => !deleteLoading && setDeleteDialog({ open: false, clientId: '', clientName: '' })}
  maxWidth="xs"
  fullWidth
  PaperProps={{ sx: { borderRadius: 3, padding: '0 !important', overflow: 'hidden' } }}
>
  <DialogTitle sx={{
    px: 3, pt: 2.5, pb: 2,
    borderBottom: '1px solid #F0F0F0',
    backgroundColor: '#fff',
    color: '#0F172A',
    fontWeight: 700,
    fontSize: '1rem',
  }}>
    Delete Client
  </DialogTitle>
  <DialogContent sx={{ px: 3, pt: 2.5 }}>
    <DialogContentText>
      Are you sure you want to delete{' '}
      <strong>{deleteDialog.clientName}</strong>?
      This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
    <Button
      variant="outlined"
      onClick={() => setDeleteDialog({ open: false, clientId: '', clientName: '' })}
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
      {deleteLoading ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
    </Button>
  </DialogActions>
</Dialog>

{/* ── Snackbar ── */}
<Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert
    severity={snackbar.severity}
    variant="filled"
    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Box>
  );
}