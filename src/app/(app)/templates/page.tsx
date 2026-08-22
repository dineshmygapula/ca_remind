'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
import { getMessageTemplates, deleteMessageTemplate } from '@/services/messageTemplateService';
import AddTemplateDialog from '@/components/templates/CreateTemplateDialog';
import TemplatesTable from '@/components/templates/TemplatesTable';
import TemplatesFilter from '@/components/templates/TemplatesFilter';
import {
  StatusFilter,
  ChannelFilter,
  ReminderTypeFilter,
} from '@/constants/messageTemplateConstants';
import EditTemplateDialog from '@/components/templates/EditTemplateDialog';
import TemplateDetailsDrawer from '@/components/templates/TemplateDetailsDrawer';

export default function TemplatesPage() {
  const { businessId } = useAuth();

  // ─── Data State ──────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<MessageTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Dialog/Drawer State ─────────────────────────────────────────────────
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ─── Filter State ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('ALL');
  const [reminderTypeFilter, setReminderTypeFilter] = useState<ReminderTypeFilter>('ALL');

  // ─── Fetch Templates ─────────────────────────────────────────────────────
  useEffect(() => {
    if (businessId) fetchTemplates();
  }, [businessId]);

  const fetchTemplates = async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getMessageTemplates(businessId);
      setTemplates(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtered Templates ──────────────────────────────────────────────────
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter === 'ACTIVE') {
      result = result.filter((t) => t.isActive === true);
    } else if (statusFilter === 'INACTIVE') {
      result = result.filter((t) => t.isActive === false);
    }

    // Channel filter
    if (channelFilter !== 'ALL') {
      result = result.filter((t) => t.channels.includes(channelFilter));
    }

    // Reminder type filter
    if (reminderTypeFilter !== 'ALL') {
      result = result.filter((t) => t.reminder_type === reminderTypeFilter);
    }

    return result;
  }, [templates, searchQuery, statusFilter, channelFilter, reminderTypeFilter]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleView = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setDrawerOpen(true);
  };

  const handleEdit = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setOpenEditDialog(true);
    setDrawerOpen(false);
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!businessId) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete the template "${templateName}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setError('');
      await deleteMessageTemplate(businessId, templateId);
      await fetchTemplates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    }
  };

  const handleCreateSuccess = () => {
    fetchTemplates();
    setOpenCreateDialog(false);
  };

  const handleEditSuccess = () => {
    fetchTemplates();
    setOpenEditDialog(false);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedTemplateId(null);
  };

  // ─── Loading Guard ───────────────────────────────────────────────────────
  if (!businessId) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Message Templates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Create and manage notification templates for reminders
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Create Template
            </Button>
          </Stack>

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <TemplatesFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            channelFilter={channelFilter}
            onChannelChange={setChannelFilter}
            reminderTypeFilter={reminderTypeFilter}
            onReminderTypeChange={setReminderTypeFilter}
          />

          {/* Results Count */}
          {!loading && (
            <Typography variant="body2" color="text.secondary">
              Showing {filteredTemplates.length} of {templates.length} templates
            </Typography>
          )}

          {/* Table */}
          <TemplatesTable
            templates={filteredTemplates}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Create Dialog */}
          <AddTemplateDialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            businessId={businessId}
            onSuccess={handleCreateSuccess}
          />

         
         
{/* Edit Dialog */}
<EditTemplateDialog
  open={openEditDialog}
  onClose={() => {
    setOpenEditDialog(false);
    setSelectedTemplateId(null);
  }}
  templateId={selectedTemplateId}
  businessId={businessId}
  onSuccess={handleEditSuccess}
/>

{/* Details Drawer */}
<TemplateDetailsDrawer
  open={drawerOpen}
  onClose={handleDrawerClose}
  templateId={selectedTemplateId}
  businessId={businessId}
  onEdit={handleEdit}
/>
        </Stack>
      </Container>
    </Box>
  );
}