'use client';

import React from 'react';
import { UserPlus, AlertCircle, Loader2, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import Drawer from '@/components/common/Drawer';
import { FormWrapper } from '@/components/wrappers/FormWrapper';
import { InputField } from '@/components/ui/InputField';
import PhoneInputField from '@/components/common/PhoneInputField';
import Dropdown from '@/components/common/Dropdown';
import { createStaff } from '@/services/staffService';
import { CreateStaffDto } from '@/types/staff.types';
import { staffFormSchema, StaffFormValues } from '@/utils/schema';
import { useAsyncAction } from '@/hooks/useAnyAction';

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
] as const;

const DEPARTMENTS = [
  { value: '', label: 'Select practice department (optional)' },
  { value: 'Taxation (GST & ITR)', label: 'Taxation (GST & ITR)' },
  { value: 'Audit & Assurance', label: 'Audit & Assurance' },
  { value: 'ROC & Corporate Law', label: 'ROC & Corporate Law' },
  { value: 'Bookkeeping & Accounting', label: 'Bookkeeping & Accounting' },
  { value: 'General Practice', label: 'General Practice' },
] as const;

const DEFAULT_FORM: StaffFormValues = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  phone: '',
  role: 'Accountant',
  department: '',
  sendInvite: true,
};

const STAFF_FORM_ID = 'add-staff-form';

function StaffFormFields() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<StaffFormValues>();

  const watchedRole = watch('role');
  const watchedDepartment = watch('department');
  const watchedPhone = watch('phone');

  return (
    <div className="space-y-4 p-6">
      {/* First & Last Name */}
      <div className="grid grid-cols-2 gap-3">
        <InputField
          name="firstName"
          label="First Name"
          required
          placeholder="e.g. Rahul"
        />
        <InputField
          name="lastName"
          label="Last Name"
          required
          placeholder="e.g. Sharma"
        />
      </div>

      {/* Username */}
      <InputField
        name="userName"
        label="Username / Handle (Optional)"
        placeholder="e.g. rahul.sharma"
      />

      {/* Email */}
      <InputField
        name="email"
        type="email"
        label="Email Address"
        required
        placeholder="rahul@example.com"
      />

      {/* Phone */}
      <div>
        <PhoneInputField
          label="Mobile Number (for WhatsApp & SMS)"
          required
          value={watchedPhone || ''}
          onChange={(val) =>
            setValue('phone', val, { shouldValidate: true, shouldDirty: true })
          }
          error={Boolean(errors.phone)}
          helperText={errors.phone?.message}
        />
      </div>

      {/* Role Selection */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[13px] font-bold text-[var(--text-primary)]">
          Assigned Role <span className="text-red-500">*</span>
        </label>
        <Dropdown
          fullWidth
          value={watchedRole || 'Accountant'}
          onChange={(val) =>
            setValue('role', val, { shouldValidate: true, shouldDirty: true })
          }
          options={ROLES}
        />
        {errors.role && (
          <p className="mt-1 text-xs font-medium leading-4 text-red-500">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Department */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[13px] font-bold text-[var(--text-primary)]">
          Practice Department
        </label>
        <Dropdown
          fullWidth
          value={watchedDepartment || ''}
          onChange={(val) =>
            setValue('department', val, { shouldValidate: true, shouldDirty: true })
          }
          options={DEPARTMENTS}
          placeholder="Select practice department (optional)"
        />
        {errors.department && (
          <p className="mt-1 text-xs font-medium leading-4 text-red-500">
            {errors.department.message}
          </p>
        )}
      </div>

      {/* Send Invitation Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('sendInvite')}
            className="checkbox checkbox-sm checkbox-primary mt-0.5 rounded"
          />
          <div className="text-xs">
            <span className="font-bold text-[var(--heading)]">
              Send login invitation
            </span>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Email setup instructions and temporary login access to this staff member.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

export default function AddStaffDialog({
  open,
  onClose,
  businessId,
  onSuccess,
}: AddStaffDialogProps) {
  const saveAction = useAsyncAction();

  const handleSubmit = async (data: StaffFormValues) => {
    if (!businessId) return;

    await saveAction.run(
      async () => {
        const payload: CreateStaffDto = {
          userName:
            data.userName?.trim() ||
            `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}`,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          department: data.department?.trim() || undefined,
          roles: [data.role],
          sendInvite: data.sendInvite,
        };

        await createStaff(businessId, payload);
      },
      {
        successMessage: `Staff member "${data.firstName} ${data.lastName}" added successfully`,
        errorMessage: 'Failed to add staff member. Please try again.',
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      }
    );
  };

  return (
    <Drawer
      open={open}
      onClose={() => !saveAction.loading && onClose()}
      title="Add Staff Member"
      width="md"
      customHeader={
        <div className="bg-[#0B1528] px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-slate-900 shadow-sm shrink-0">
              <UserPlus className="h-5 w-5 text-slate-900" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider mb-0.5">
                Team Management
              </p>
              <h2 className="text-lg font-bold leading-tight text-white truncate">
                Add Staff Member
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saveAction.loading}
            aria-label="Close"
            className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={saveAction.loading}
            className="rounded-xl border border-divider py-2.5 px-6 text-sm font-semibold text-txt-main bg-surface transition-colors hover:bg-bg cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={STAFF_FORM_ID}
            disabled={saveAction.loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 py-2.5 px-6 text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {saveAction.loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                <span>Adding Member...</span>
              </>
            ) : (
              <span>Add Staff Member</span>
            )}
          </button>
        </div>
      }
    >
      {saveAction.error && (
        <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{saveAction.error}</span>
        </div>
      )}

      <FormWrapper<typeof staffFormSchema>
        schema={staffFormSchema}
        defaultValues={DEFAULT_FORM}
        onSubmit={handleSubmit}
        formId={STAFF_FORM_ID}
      >
        <StaffFormFields />
      </FormWrapper>
    </Drawer>
  );
}