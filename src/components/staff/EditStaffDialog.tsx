'use client';

import { useState, useEffect } from 'react';
import { Pencil, AlertCircle, Loader2 } from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import { StaffDetails, UpdateStaffDto } from '@/types/staff.types';
import { updateStaff } from '@/services/staffService';
import PhoneInputField from '../common/PhoneInputField';

interface EditStaffDialogProps {
  open: boolean;
  onClose: () => void;
  membershipId: string | null;
  businessId: string;
  onSuccess: () => void;
  staffData: StaffDetails | null;
}

const ROLES = [
  { value: 'Accountant', label: 'Accountant (Compliance & Bookkeeping)' },
  { value: 'Manager', label: 'Manager (Practice & Task Supervisor)' },
  { value: 'Admin', label: 'Admin (Full Workspace Control)' },
];

export default function EditStaffDialog({
  open,
  onClose,
  membershipId,
  businessId,
  onSuccess,
  staffData,
}: EditStaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [role, setRole] = useState('Accountant');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Pre-fill form from staffData
  useEffect(() => {
    if (open && staffData) {
      setRole(staffData.role || staffData.roles?.[0] || 'Accountant');
      setStatus(staffData.status || 'ACTIVE');
      setUserName(staffData.userName || '');
      setFirstName(staffData.contact?.firstName || '');
      setLastName(staffData.contact?.lastName || '');
      setPhone(staffData.contact?.phone || '');
      setError('');
      setFieldErrors({});
    }
  }, [open, staffData]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!firstName.trim()) {
      errs.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      errs.lastName = 'Last name is required';
    }
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate() || !businessId || !membershipId) return;

    try {
      setLoading(true);
      setError('');

      const dto: UpdateStaffDto = {
        membership: {
          isActive: status === 'ACTIVE',
          roles: role ? [role] : [],
        },
        user: {
          userName: userName.trim() || undefined,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        },
      };

      await updateStaff(businessId, membershipId, dto);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Update staff error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update staff member. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={() => !loading && onClose()}
      eyebrow="Team Management"
      title="Edit Staff Member"
      icon={<Pencil className="h-5 w-5 text-white" />}
      width="md"
      submitLabel={loading ? 'Saving Changes...' : 'Save Changes'}
      submitting={loading}
      onSubmit={() => {
        const formEl = document.getElementById('edit-staff-form') as HTMLFormElement;
        if (formEl) formEl.requestSubmit();
      }}
      onCancel={() => !loading && onClose()}
      cancelLabel="Cancel"
    >
      <form id="edit-staff-form" onSubmit={handleSubmit} className="space-y-4 p-6">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--heading)] mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className={`h-10 w-full rounded-xl border bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--primary)]/10 ${
                fieldErrors.firstName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--primary)]'
              }`}
            />
            {fieldErrors.firstName && (
              <p className="mt-1 text-[11px] text-red-500">{fieldErrors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--heading)] mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className={`h-10 w-full rounded-xl border bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--primary)]/10 ${
                fieldErrors.lastName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--primary)]'
              }`}
            />
            {fieldErrors.lastName && (
              <p className="mt-1 text-[11px] text-red-500">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Username / Handle
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          />
        </div>

        {/* Email Display (Read-only) */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Email Address
          </label>
          <input
            type="email"
            disabled
            value={staffData?.contact?.email || ''}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--border)]/30 px-3 text-xs text-[var(--text-secondary)] outline-none cursor-not-allowed"
          />
          <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
            Email address cannot be modified once registered.
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <PhoneInputField
            value={phone}
            onChange={(p) => setPhone(p)}
            error={Boolean(fieldErrors.phone)}
            helperText={fieldErrors.phone}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Role & Permissions <span className="text-red-500">*</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Toggle */}
        <div className="pt-2">
          <label className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-3.5 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-[var(--heading)]">
                Active Member Account
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Inactive staff members are blocked from logging into the workspace.
              </div>
            </div>
            <input
              type="checkbox"
              checked={status === 'ACTIVE'}
              onChange={(e) => setStatus(e.target.checked ? 'ACTIVE' : 'INACTIVE')}
              className="toggle toggle-primary toggle-sm"
            />
          </label>
        </div>
      </form>
    </Drawer>
  );
}