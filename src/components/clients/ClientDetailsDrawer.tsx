'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Users,
  FileText,
  Clock,
  Loader2,
  AlertCircle,
  Pencil,
  ChevronDown,
  ChevronUp,
  UserPlus,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import { getSubjectById, updateSubject } from '@/services/subjectService';
import { Subject, ComplianceService } from '@/types/subject';
import { getStaff } from '@/services/staffService';
import type { StaffMember } from '@/types/staff.types';
import { getTasks } from '@/services/taskService';
import type { TaskListItem } from '@/types/task.types';

interface ClientDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  clientId: string | null;
  businessId: string;
  onEdit: (clientId: string) => void;
}

const COMPLIANCE_KEYS = [
  { key: 'gst', label: 'GST Filing', icon: '📋' },
  { key: 'tds', label: 'TDS Returns', icon: '🏦' },
  { key: 'itr', label: 'Income Tax (ITR)', icon: '📄' },
  { key: 'roc', label: 'ROC Filings', icon: '🏢' },
  { key: 'msme', label: 'MSME Filings', icon: '🏭' },
] as const;

export default function ClientDetailsDrawer({
  open,
  onClose,
  clientId,
  businessId,
  onEdit,
}: ClientDetailsDrawerProps) {
  const [client, setClient] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Assign Team states
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [savingAssignee, setSavingAssignee] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Upcoming Tasks
  const [upcomingTasks, setUpcomingTasks] = useState<TaskListItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Accordion open/close state for compliance services
  const [openComplianceKey, setOpenComplianceKey] = useState<string | null>('gst');

  useEffect(() => {
    if (open && clientId && businessId) {
      fetchClientDetails();
      fetchStaff();
      fetchUpcomingTasks();
      setShowAssignPanel(false);
      setSelectedStaffId('');
      setAssignError('');
    }
  }, [open, clientId, businessId]);

  const fetchClientDetails = async () => {
    if (!clientId || !businessId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getSubjectById(businessId, clientId);
      setClient(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const data = await getStaff(businessId);
      setStaffList(data);
    } catch {
      // Non-critical
    } finally {
      setLoadingStaff(false);
    }
  };

  const fetchUpcomingTasks = async () => {
    if (!clientId || !businessId) return;
    try {
      setLoadingTasks(true);
      const tasks = await getTasks(businessId);
      const forClient = (tasks || []).filter(
        (t) => t.subject?.id === clientId && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
      );
      setUpcomingTasks(forClient);
    } catch {
      // Non-critical
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId || !clientId) return;
    const selected = staffList.find((s) => s.id === selectedStaffId);
    if (!selected) return;

    const displayName =
      `${selected.firstName ?? ''} ${selected.lastName ?? ''}`.trim() ||
      selected.userName ||
      '';

    try {
      setSavingAssignee(true);
      setAssignError('');
      await updateSubject(businessId, clientId, {
        assignedTeam: {
          primaryAssignee: {
            userId: selected.id,
            name: displayName,
          },
        },
      });
      await fetchClientDetails();
      setShowAssignPanel(false);
      setSelectedStaffId('');
    } catch (err: unknown) {
      setAssignError(err instanceof Error ? err.message : 'Failed to assign staff');
    } finally {
      setSavingAssignee(false);
    }
  };

  const handleClose = () => {
    setClient(null);
    setError('');
    onClose();
  };

  const InfoRow = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="flex items-start gap-3 py-2 border-b border-[var(--border)]/60 last:border-b-0">
      {Icon && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--accent)]">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-txt-sub">
          {label}
        </p>
        <div className="text-sm font-medium text-txt-main mt-0.5 break-words">
          {value || '—'}
        </div>
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      eyebrow="Client Overview"
      title={client?.profile?.displayName || (loading ? 'Loading...' : 'Client Details')}
      width="lg"
      badge={
        client ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
              client.isActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-white/10 text-white/70 border-white/20'
            }`}
          >
            {client.isActive ? 'Active' : 'Inactive'}
          </span>
        ) : undefined
      }
      icon={<User className="h-4 w-4 text-[var(--accent)]" />}
      headerActions={
        clientId && (
          <button
            type="button"
            onClick={() => {
              handleClose();
              onEdit(clientId);
            }}
            aria-label="Edit client"
            className="rounded-xl bg-white/10 border border-white/20 p-1.5 transition-all hover:bg-white/25 hover:scale-105 text-white"
            title="Edit Client"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )
      }
      footer={
        client ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                handleClose();
                onEdit(client.id);
              }}
              className="btn btn-primary btn-sm flex-1 font-bold"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Client
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline btn-sm text-txt-sub"
            >
              Close
            </button>
          </div>
        ) : undefined
      }
    >
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-txt-sub">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mb-2" />
          <span className="text-sm">Loading client details...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && client && (
        <div className="space-y-4">
          {/* ── 1. Profile Details Card ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/70">
              <Building2 className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                Business &amp; Profile Details
              </h3>
            </div>

            <div className="divide-y divide-[var(--border)]/40">
              <InfoRow label="Display Name" value={client.profile?.displayName} />
              <InfoRow label="Business Name" value={client.profile?.businessName} />
              <InfoRow label="Legal Name" value={client.profile?.legalName} />
              <InfoRow label="Constitution" value={client.profile?.constitution} />
              <InfoRow label="Industry" value={client.profile?.industry} />
              {client.identifiers?.pan && (
                <InfoRow
                  label="PAN"
                  value={<span className="font-mono text-xs font-bold">{client.identifiers.pan}</span>}
                />
              )}
              {client.identifiers?.tan && (
                <InfoRow
                  label="TAN"
                  value={<span className="font-mono text-xs font-bold">{client.identifiers.tan}</span>}
                />
              )}
              {client.identifiers?.cin && (
                <InfoRow
                  label="CIN"
                  value={<span className="font-mono text-xs font-bold">{client.identifiers.cin}</span>}
                />
              )}
              {client.identifiers?.udyam && (
                <InfoRow
                  label="UDYAM"
                  value={<span className="font-mono text-xs font-bold">{client.identifiers.udyam}</span>}
                />
              )}
            </div>
          </div>

          {/* ── 2. Contact & Address Card ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/70">
              <Phone className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                Contact &amp; Location
              </h3>
            </div>

            <div className="divide-y divide-[var(--border)]/40">
              <InfoRow
                label="Primary Phone"
                value={client.primaryContact?.phone || (client as any).phone}
                icon={Phone}
              />
              <InfoRow
                label="Primary Email"
                value={client.primaryContact?.email || (client as any).email}
                icon={Mail}
              />
              {client.addresses && client.addresses.length > 0 && (
                <div className="py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-txt-sub mb-1.5">
                    Addresses ({client.addresses.length})
                  </p>
                  <div className="space-y-2">
                    {client.addresses.map((addr, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] p-2.5 text-xs text-txt-main"
                      >
                        <span className="badge badge-xs badge-ghost font-bold text-[10px] mb-1">
                          {addr.type || 'Address'}
                        </span>
                        <p>{[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. GSTINs List ── */}
          {client.gst?.gstins && client.gst.gstins.length > 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/70">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[var(--accent)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                    GST Registrations
                  </h3>
                </div>
                <span className="badge badge-sm badge-ghost text-txt-sub">
                  {client.gst.gstins.length} GSTIN{client.gst.gstins.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {client.gst.gstins.map((g, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-txt-main">{g.gstin}</span>
                      <p className="text-[10px] text-txt-sub">{g.state} {g.registrationType ? `· ${g.registrationType}` : ''}</p>
                    </div>
                    <span className="badge badge-xs badge-success text-white font-semibold">
                      {g.status || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 4. Active Compliances ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/70">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                  Compliance Services
                </h3>
              </div>
              <span className="badge badge-sm badge-ghost text-txt-sub">
                {(client as any).activeCompliances?.length || 0} active
              </span>
            </div>

            <div className="space-y-2">
              {COMPLIANCE_KEYS.map(({ key, label, icon }) => {
                const isEnabled = (client as any).activeCompliances?.includes(key.toLowerCase());
                const profile = (client.metadata?.complianceProfile as any)?.[key];
                const isOpen = openComplianceKey === key;

                return (
                  <div
                    key={key}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenComplianceKey(isOpen ? null : key)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--border)]/30 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="font-bold text-txt-main">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge badge-xs ${
                            isEnabled
                              ? 'bg-emerald-500 text-white border-none'
                              : 'badge-ghost text-txt-sub opacity-60'
                          }`}
                        >
                          {isEnabled ? 'Enabled' : 'Not configured'}
                        </span>
                        {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-txt-sub" /> : <ChevronDown className="h-3.5 w-3.5 text-txt-sub" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-3 border-t border-[var(--border)]/60 bg-[var(--surface)] text-xs space-y-1.5">
                        {isEnabled && profile ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-txt-sub">Frequency</p>
                              <p className="font-semibold text-txt-main">{profile.frequency || 'Monthly'}</p>
                            </div>
                            {profile.internalTargetOffsetDays != null && (
                              <div>
                                <p className="text-[10px] uppercase font-bold text-txt-sub">Target Offset</p>
                                <p className="font-semibold text-txt-main">{profile.internalTargetOffsetDays} days</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-txt-sub italic text-[11px]">
                            This compliance service has not been configured for this client.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. Assigned Team & Reassign ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/70">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                  Assigned Staff
                </h3>
              </div>
            </div>

            {client.assignedTeam?.primaryAssignee?.name && !showAssignPanel ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white font-bold text-xs">
                    {client.assignedTeam.primaryAssignee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-txt-main">{client.assignedTeam.primaryAssignee.name}</p>
                    <p className="text-[10px] text-txt-sub">Primary Assignee</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssignPanel(true)}
                  className="btn btn-ghost btn-xs text-[var(--accent)] font-bold"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {!showAssignPanel ? (
                  <button
                    type="button"
                    onClick={() => setShowAssignPanel(true)}
                    className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>+ Assign Staff Member</span>
                  </button>
                ) : (
                  <div className="space-y-2 p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <label className="block text-xs font-bold text-txt-main">
                      Select Staff Member
                    </label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="select select-bordered select-sm w-full font-medium"
                    >
                      <option value="">Choose staff...</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName && s.lastName
                            ? `${s.firstName} ${s.lastName}`
                            : s.userName || 'Unnamed'}
                        </option>
                      ))}
                    </select>

                    {assignError && (
                      <p className="text-xs text-red-600">{assignError}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAssignStaff}
                        disabled={!selectedStaffId || savingAssignee}
                        className="btn btn-primary btn-xs font-bold"
                      >
                        {savingAssignee && <Loader2 className="h-3 w-3 animate-spin" />}
                        Save Assignee
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAssignPanel(false)}
                        className="btn btn-ghost btn-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 6. Upcoming Tasks ── */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/70">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-txt-main">
                  Upcoming Compliance Tasks
                </h3>
              </div>
              <span className="badge badge-sm badge-ghost text-txt-sub">
                {upcomingTasks.length} pending
              </span>
            </div>

            {loadingTasks ? (
              <p className="text-xs text-txt-sub">Loading tasks...</p>
            ) : upcomingTasks.length === 0 ? (
              <p className="text-xs text-txt-sub italic">No pending tasks for this client.</p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-txt-main truncate">{t.title}</p>
                      <p className="text-[10px] text-txt-sub font-mono">
                        Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                    <span className="badge badge-xs badge-info text-white font-bold">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
