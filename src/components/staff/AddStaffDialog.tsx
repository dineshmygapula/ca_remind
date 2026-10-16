'use client';

import { useState } from 'react';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import Drawer from '@/components/common/Drawer';
import { CreateStaffDto } from '@/types/staff.types';
import { createStaff } from '@/services/staffService';
import PhoneInputField from '../common/PhoneInputField';

interface AddStaffDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess: () => void;
}

const ROLES = [
  { value: 'Accountant', label: 'Accountant (Compliance & Bookkeeping)' },
  { value: 'Manager', label: 'Manager (Practice & Task Supervisor)' },
  { value: 'Admin', label: 'Admin (Full Workspace Control)' },
];

const DEPARTMENTS = [
  'Taxation (GST & ITR)',
  'Audit & Assurance',
  'ROC & Corporate Law',
  'Bookkeeping & Accounting',
  'General Practice',
];

const DEFAULT_FORM: CreateStaffDto = {
  userName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  roles: ['Accountant'],
  sendInvite: true,
};

export default function AddStaffDialog({
  open,
  onClose,
  businessId,
  onSuccess,
}: AddStaffDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateStaffDto>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateStaffDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Invalid email address format';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.roles || formData.roles.length === 0) {
      errs.roles = 'Please select a role';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate() || !businessId) return;

    try {
      setLoading(true);
      setError('');

      const payload: CreateStaffDto = {
        userName: formData.userName?.trim() || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: formData.department?.trim() || undefined,
        roles: formData.roles,
        sendInvite: formData.sendInvite,
      };

      await createStaff(businessId, payload);
      setFormData(DEFAULT_FORM);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Create staff error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to add staff member. Please try again.'
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
      title="Add Staff Member"
      icon={<UserPlus className="h-5 w-5 text-white" />}
      width="md"
      submitLabel={loading ? 'Adding Member...' : 'Add Staff Member'}
      submitting={loading}
      onSubmit={() => {
        const formEl = document.getElementById('add-staff-form') as HTMLFormElement;
        if (formEl) formEl.requestSubmit();
      }}
      onCancel={() => !loading && onClose()}
      cancelLabel="Cancel"
    >
      <form id="add-staff-form" onSubmit={handleSubmit} className="space-y-4 p-6">
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
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="e.g. Rahul"
              className={`h-10 w-full rounded-xl border bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--primary)]/10 ${
                errors.firstName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--primary)]'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-[11px] text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--heading)] mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="e.g. Sharma"
              className={`h-10 w-full rounded-xl border bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--primary)]/10 ${
                errors.lastName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--primary)]'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-[11px] text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Username / Handle (Optional)
          </label>
          <input
            type="text"
            value={formData.userName || ''}
            onChange={(e) => handleChange('userName', e.target.value)}
            placeholder="e.g. rahul.sharma"
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="rahul@example.com"
            className={`h-10 w-full rounded-xl border bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--primary)]/10 ${
              errors.email
                ? 'border-red-500 focus:border-red-500'
                : 'border-[var(--border)] focus:border-[var(--primary)]'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Mobile Number (for WhatsApp & SMS) <span className="text-red-500">*</span>
          </label>
          <PhoneInputField
            value={formData.phone}
            onChange={(phone) => handleChange('phone', phone)}
            error={Boolean(errors.phone)}
            helperText={errors.phone}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Assigned Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.roles[0] || 'Accountant'}
            onChange={(e) => handleChange('roles', [e.target.value])}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-bold text-[var(--heading)] mb-1">
            Practice Department
          </label>
          <select
            value={formData.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">Select practice department (optional)</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Send Invitation Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sendInvite}
              onChange={(e) => handleChange('sendInvite', e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary mt-0.5 rounded"
            />
            <div className="text-xs">
              <span className="font-bold text-[var(--heading)]">Send login invitation</span>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Email setup instructions and temporary login access to this staff member.
              </p>
            </div>
          </label>
        </div>
      </form>
    </Drawer>
  );
}