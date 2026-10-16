'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { MessageTemplateListItem } from '@/types/messageTemplate.types';
import {
  getMessageTemplates,
  deleteMessageTemplate,
} from '@/services/messageTemplateService';
import TemplatesTable from '@/components/templates/TemplatesTable';
import TemplatesFilter from '@/components/templates/TemplatesFilter';
import TemplateFormDrawer from '@/components/templates/TemplateFormDrawer';
import TemplateDetailsDrawer from '@/components/templates/TemplateDetailsDrawer';
import ConfirmDialog from '@/components/tasks/ConfirmDialog';
import {
  StatusFilter,
  ChannelFilter,
  ReminderTypeFilter,
} from '@/constants/messageTemplateConstants';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function TemplatesPage() {
  const { businessId } = useWorkspace();

  // Data state
  const [templates, setTemplates] = useState<MessageTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Drawer and dialog state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('ALL');
  const [reminderTypeFilter, setReminderTypeFilter] = useState<ReminderTypeFilter>('ALL');

  const fetchTemplates = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError('');
      const data = await getMessageTemplates(businessId);
      setTemplates(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch templates'
      );
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      fetchTemplates();
    }
  }, [businessId, fetchTemplates]);

  // Derived stats
  const activeCount = useMemo(
    () => templates.filter((t) => t.isActive).length,
    [templates]
  );
  const whatsappCount = useMemo(
    () => templates.filter((t) => t.channels?.includes('whatsapp')).length,
    [templates]
  );
  const emailCount = useMemo(
    () => templates.filter((t) => t.channels?.includes('email')).length,
    [templates]
  );

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.key?.toLowerCase().includes(query) ||
          t.reminder_type?.toLowerCase().includes(query)
      );
    }

    if (statusFilter === 'ACTIVE') {
      result = result.filter((t) => t.isActive === true);
    } else if (statusFilter === 'INACTIVE') {
      result = result.filter((t) => t.isActive === false);
    }

    if (channelFilter !== 'ALL') {
      result = result.filter((t) => t.channels?.includes(channelFilter));
    }

    if (reminderTypeFilter !== 'ALL') {
      result = result.filter((t) => t.reminder_type === reminderTypeFilter);
    }

    return result;
  }, [templates, searchQuery, statusFilter, channelFilter, reminderTypeFilter]);

  // Handlers
  const handleCreate = () => {
    setDrawerOpen(false);
    setSelectedTemplateId(null);
    setEditingTemplateId(null);
    setFormDrawerOpen(true);
  };

  const handleView = (templateId: string) => {
    setFormDrawerOpen(false);
    setEditingTemplateId(null);
    setSelectedTemplateId(templateId);
    setDrawerOpen(true);
  };

  const handleEdit = (templateId: string) => {
    setDrawerOpen(false);
    setSelectedTemplateId(null);
    setEditingTemplateId(templateId);
    setFormDrawerOpen(true);
  };

  const handleDeleteRequest = (templateId: string, templateName: string) => {
    setDeleteTarget({ id: templateId, name: templateName });
  };

  const handleDeleteConfirm = async () => {
    if (!businessId || !deleteTarget) return;

    try {
      setDeleteLoading(true);
      setError('');
      await deleteMessageTemplate(businessId, deleteTarget.id);
      setDeleteTarget(null);
      await fetchTemplates();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete template'
      );
    } finally {
      setDeleteLoading(false);
    }
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
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-txt-main">
              Message templates
            </h1>
            <p className="mt-1 text-sm text-txt-sub">
              Create and manage notification templates for compliance reminders.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-900 font-semibold px-4 py-2.5 text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-900" />
            <span>New template</span>
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
              onClick={() => setError('')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total templates */}
          <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
            <span className="text-xs font-medium text-txt-sub">Total templates</span>
            <div className="text-3xl font-bold text-txt-main mt-2 mb-1">
              {templates.length}
            </div>
            <span className="text-xs text-txt-sub">
              {templates.length > 0 && activeCount === templates.length
                ? 'All active'
                : `${activeCount} active`}
            </span>
          </div>

          {/* WhatsApp Enabled */}
          <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
            <span className="text-xs font-medium text-txt-sub">WhatsApp enabled</span>
            <div className="text-3xl font-bold text-[#15803d] dark:text-emerald-400 mt-2 mb-1">
              {whatsappCount}
            </div>
            <span className="text-xs text-txt-sub">Instant messaging ready</span>
          </div>

          {/* Email Enabled */}
          <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
            <span className="text-xs font-medium text-txt-sub">Email enabled</span>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2 mb-1">
              {emailCount}
            </div>
            <span className="text-xs text-txt-sub">Email delivery ready</span>
          </div>

          {/* Active Status */}
          <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs">
            <span className="text-xs font-medium text-txt-sub">Active templates</span>
            <div className="text-3xl font-bold text-[#059669] dark:text-emerald-400 mt-2 mb-1">
              {activeCount} of {templates.length}
            </div>
            <span className="text-xs text-txt-sub">Ready for automated alerts</span>
          </div>
        </div>

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
          onReset={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
            setChannelFilter('ALL');
            setReminderTypeFilter('ALL');
          }}
        />

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-txt-sub">
            Showing {filteredTemplates.length} of {templates.length} templates
          </p>
        )}

        {/* Table using CommonDataGrid */}
        <TemplatesTable
          templates={filteredTemplates}
          loading={loading}
          businessId={businessId}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onRefresh={fetchTemplates}
        />

        {/* View Details Drawer */}
        <TemplateDetailsDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedTemplateId(null);
          }}
          templateId={selectedTemplateId}
          businessId={businessId}
          onEdit={handleEdit}
        />

        {/* Unified Right-Side Form Drawer (Edit / Create) */}
        <TemplateFormDrawer
          open={formDrawerOpen}
          onClose={() => {
            setFormDrawerOpen(false);
            setEditingTemplateId(null);
          }}
          templateId={editingTemplateId}
          businessId={businessId}
          onSuccess={() => {
            fetchTemplates();
            setFormDrawerOpen(false);
            setEditingTemplateId(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Template"
          description={
            <>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action
              cannot be undone.
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
