'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pencil,
  Loader2,
  AlertCircle,
  ExternalLink,
  Shield,
  Calendar,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import {
  StaffDetails,
  StaffDashboardResponse,
  StaffWorkSummary,
} from '@/types/staff.types';
import { getStaffById, getStaffDashboard } from '@/services/staffService';

function computeWorkSummary(dashboard: StaffDashboardResponse): StaffWorkSummary {
  const tasks = dashboard.tasks?.items ?? [];
  const now = new Date();
  return {
    totalClients: dashboard.clients?.items?.length ?? 0,
    pendingTasks: tasks.filter(
      (t) => t.status === 'OPEN' && new Date(t.due_date) >= now
    ).length,
    overdueTasks: tasks.filter(
      (t) => t.status === 'OPEN' && new Date(t.due_date) < now
    ).length,
    completedTasks: tasks.filter((t) => t.status === 'CLOSED').length,
  };
}

const getInitials = (name?: string) => {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface StaffDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  membershipId: string | null;
  businessId: string;
  onEdit: (membershipId: string) => void;
}

export default function StaffDetailsDrawer({
  open,
  onClose,
  membershipId,
  businessId,
  onEdit,
}: StaffDetailsDrawerProps) {
  const [staff, setStaff] = useState<StaffDetails | null>(null);
  const [dashboard, setDashboard] = useState<StaffDashboardResponse | null>(null);
  const [summary, setSummary] = useState<StaffWorkSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'workload' | 'clients' | 'tasks'>('workload');

  const fetchData = useCallback(async () => {
    if (!membershipId || !businessId) return;

    try {
      setLoading(true);
      setError('');

      const [staffData, dashData] = await Promise.all([
        getStaffById(businessId, membershipId),
        getStaffDashboard(businessId, membershipId).catch((err) => {
          console.warn('Dashboard data not available for staff:', err);
          return null;
        }),
      ]);

      setStaff(staffData);

      if (dashData) {
        setDashboard(dashData);
        setSummary(computeWorkSummary(dashData));
      } else {
        setDashboard(null);
        setSummary({
          totalClients: 0,
          pendingTasks: 0,
          overdueTasks: 0,
          completedTasks: 0,
        });
      }
    } catch (err: unknown) {
      console.error('Fetch staff details error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load staff details');
    } finally {
      setLoading(false);
    }
  }, [businessId, membershipId]);

  useEffect(() => {
    if (open && membershipId) {
      fetchData();
      setActiveTab('workload');
    } else {
      setStaff(null);
      setDashboard(null);
      setSummary(null);
    }
  }, [open, membershipId, fetchData]);

  const fullName =
    staff?.userName ||
    `${staff?.contact?.firstName ?? ''} ${staff?.contact?.lastName ?? ''}`.trim() ||
    'Staff Member';

  const role = (staff?.roles?.[0] || staff?.role || 'Staff').toUpperCase();
  const isActive = staff?.status === 'ACTIVE';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="Staff Directory"
      title={fullName}
      badge={
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {isActive ? 'Active' : 'Inactive'}
        </span>
      }
      icon={<Users className="h-5 w-5 text-white" />}
      width="lg"
      headerActions={
        membershipId && (
          <button
            type="button"
            onClick={() => onEdit(membershipId)}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
          >
            <Pencil className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Edit Staff</span>
          </button>
        )
      }
    >
      {loading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Loading member profile...
          </span>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">{error}</div>
          </div>
        </div>
      ) : staff ? (
        <div className="space-y-6 p-6">
          {/* Member Profile Card */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-white dark:bg-[var(--accent)] dark:text-[#0b1220] font-black text-lg shadow-sm">
                {getInitials(fullName)}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--heading)]">{fullName}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                    <Shield className="h-3 w-3" />
                    {role}
                  </span>
                  {staff.lastActiveAt && (
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      Updated {new Date(staff.lastActiveAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {staff.contact?.phone && (
                <a
                  href={`https://wa.me/${staff.contact.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--heading)]">
              Contact Information
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-[var(--text-secondary)]">Email Address</div>
                  <div className="font-semibold text-[var(--text-primary)] truncate">
                    {staff.contact?.email || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-[var(--text-secondary)]">Mobile Number</div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {staff.contact?.phone || staff.contact?.phoneMasked || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workload Stats Grid */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--heading)]">
              Workload & Performance Overview
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="flex items-center justify-between text-blue-600">
                  <Users className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase">Clients</span>
                </div>
                <div className="mt-2 text-2xl font-black text-[var(--heading)]">
                  {summary?.totalClients ?? 0}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">Assigned portfolio</div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="flex items-center justify-between text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase">Pending</span>
                </div>
                <div className="mt-2 text-2xl font-black text-amber-600">
                  {summary?.pendingTasks ?? 0}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">Open tasks</div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="flex items-center justify-between text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase">Overdue</span>
                </div>
                <div className="mt-2 text-2xl font-black text-red-600">
                  {summary?.overdueTasks ?? 0}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">Requires action</div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="flex items-center justify-between text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[11px] font-bold uppercase">Done</span>
                </div>
                <div className="mt-2 text-2xl font-black text-emerald-600">
                  {summary?.completedTasks ?? 0}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">Closed tasks</div>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[var(--border)] text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('workload')}
              className={`pb-2.5 px-3 border-b-2 transition-colors ${
                activeTab === 'workload'
                  ? 'border-[var(--primary)] text-[var(--primary)] dark:border-[var(--accent)] dark:text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--heading)]'
              }`}
            >
              Assigned Tasks ({dashboard?.tasks?.items?.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`pb-2.5 px-3 border-b-2 transition-colors ${
                activeTab === 'clients'
                  ? 'border-[var(--primary)] text-[var(--primary)] dark:border-[var(--accent)] dark:text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--heading)]'
              }`}
            >
              Assigned Clients ({dashboard?.clients?.items?.length ?? 0})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'workload' ? (
            <div className="space-y-2.5">
              {!dashboard?.tasks?.items || dashboard.tasks.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--text-secondary)]">
                  No compliance tasks currently assigned to this member.
                </div>
              ) : (
                dashboard.tasks.items.map((task) => {
                  const isClosed = task.status === 'CLOSED';
                  return (
                    <div
                      key={task.task_id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-xs shadow-sm"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="font-bold text-[var(--heading)] truncate">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                          <span>Client: {task.subject?.name || '—'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isClosed
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {!dashboard?.clients?.items || dashboard.clients.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-xs text-[var(--text-secondary)]">
                  No clients currently assigned to this member.
                </div>
              ) : (
                dashboard.clients.items.map((client) => (
                  <div
                    key={client.subject_id}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 text-xs shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-[var(--heading)]">
                        {client.display_name}
                      </div>
                      {client.city && (
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          {client.city}
                        </div>
                      )}
                    </div>
                    {client.next_due_hint && (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        {client.next_due_hint}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : null}
    </Drawer>
  );
}