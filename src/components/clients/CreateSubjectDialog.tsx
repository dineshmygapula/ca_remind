'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserRoundPlus,
  UserRound,
  Phone,
  Mail,
  Building2,
  ChevronDown,
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Landmark,
  FileCheck,
  Briefcase,
  Factory,
} from 'lucide-react';

import Drawer from '@/components/common/Drawer';
import DrawerSection from '@/components/common/DrawerSection';
import WhatsAppIcon from '@/components/common/WhatsAppIcon';
import AddStaffDialog from '../staff/AddStaffDialog';

import { createSubject } from '@/services/subjectService';
import { getStaff } from '@/services/staffService';
import { DEFAULT_FORM } from '@/constants/clientConstants';
import type { CreateSubjectDto, AddressType } from '@/types/subject';
import type { StaffMember } from '@/types/staff.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  businessId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── Style Primitives (Aligned with Tasks & Reminders) ─────────────────────────

const INPUT =
  'w-full h-11 rounded-xl border border-divider bg-bg/50 px-3.5 ' +
  'text-sm font-medium text-txt-main placeholder:text-txt-sub/60 ' +
  'focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all';

const SELECT =
  'w-full h-11 rounded-xl border border-divider bg-bg/50 pl-3.5 pr-9 ' +
  'text-sm font-medium text-txt-main appearance-none cursor-pointer ' +
  'focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all';

const TEXTAREA =
  'w-full rounded-xl border border-divider bg-bg/50 p-3.5 ' +
  'text-sm font-medium text-txt-main placeholder:text-txt-sub/60 resize-none ' +
  'focus:bg-surface focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all';

function FieldWrap({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-txt-main flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      {children}
      {error && <p className="text-xs text-red-500 font-medium leading-none mt-0.5">{error}</p>}
    </div>
  );
}

// ─── Compliance Services Meta ─────────────────────────────────────────────────

const COMPLIANCE_ITEMS = [
  {
    key: 'complianceGst',
    label: 'GST',
    code: 'GST',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
  },
  {
    key: 'complianceTds',
    label: 'TDS',
    code: 'TDS',
    icon: <Landmark className="h-4 w-4" />,
    color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
  },
  {
    key: 'complianceItr',
    label: 'ITR',
    code: 'ITR',
    icon: <FileCheck className="h-4 w-4" />,
    color: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/40',
  },
  {
    key: 'complianceRoc',
    label: 'ROC',
    code: 'ROC',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
  },
  {
    key: 'complianceMsme',
    label: 'MSME',
    code: 'MSME',
    icon: <Factory className="h-4 w-4" />,
    color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40',
  },
] as const;

export default function CreateSubjectDialog({
  businessId,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
  });

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [openCreateStaff, setOpenCreateStaff] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch staff members
  const fetchStaff = useCallback(async () => {
    try {
      setLoadingStaff(true);
      const data = await getStaff(businessId);
      setStaffList(data);
    } catch (err) {
      console.error('Failed to fetch staff', err);
    } finally {
      setLoadingStaff(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (open) fetchStaff();
  }, [open, fetchStaff]);

  // Set compliance service values
  function setCompliance(
    key: keyof typeof form,
    field: 'enabled' | 'frequency',
    value: boolean | string,
  ) {
    setForm((prev) => {
      const current = prev[key];
      if (typeof current !== 'object') return prev;
      return {
        ...prev,
        [key]: {
          ...current,
          [field]: value,
        },
      };
    });
  }

  const handleClose = () => {
    if (!loading) {
      setForm(DEFAULT_FORM);
      setNotes('');
      setApiError('');
      setSuccessMessage('');
      setErrors({ fullName: '', phone: '', email: '', companyName: '' });
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      phone: '',
      email: '',
      companyName: '',
    };

    if (!form.fullName.trim()) newErrors.fullName = 'Please enter full name';

    if (!form.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Please enter email address';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.companyName.trim()) {
      newErrors.companyName = 'Please enter business name';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setApiError('');

      const dto: CreateSubjectDto = {
        subjectType: 'CLIENT',
        profile: {
          displayName: form.fullName,
          businessName: form.companyName || form.fullName,
          legalName: form.companyName || form.fullName,
          constitution: 'INDIVIDUAL',
          industry: 'General',
          businessNature: ['General'],
        },
        primaryContact: {
          name: form.fullName,
          phone: form.phone,
          email: form.email,
        },
        contacts: [],
        isActive: true,
      };

      if (form.pan || form.tan || form.cin || form.udyam || form.iec) {
        dto.identifiers = {
          pan: form.pan || undefined,
          tan: form.tan || undefined,
          cin: form.cin || undefined,
          udyam: form.udyam || undefined,
          iec: form.iec || undefined,
        };
      }

      const validGstins = form.gstins.filter(
        (gstin) => gstin.gstin && gstin.gstin.trim() !== '',
      );
      if (validGstins.length > 0) {
        dto.gst = {
          gstins: validGstins.map((gstin) => ({
            gstin: gstin.gstin.toUpperCase(),
            state: gstin.state,
            registrationType: gstin.registrationType,
            status: gstin.status,
          })),
        };
      }

      const validAddresses = form.addresses.filter((address) => address.line1?.trim());
      if (validAddresses.length > 0) dto.addresses = validAddresses;

      dto.metadata = {
        complianceProfile: {
          gst: {
            enabled: form.complianceGst.enabled,
            frequency: form.complianceGst.frequency,
          },
          tds: {
            enabled: form.complianceTds.enabled,
            frequency: form.complianceTds.frequency,
          },
          itr: {
            enabled: form.complianceItr.enabled,
            frequency: form.complianceItr.frequency,
          },
          roc: {
            enabled: form.complianceRoc.enabled,
            frequency: form.complianceRoc.frequency,
          },
          msme: {
            enabled: form.complianceMsme.enabled,
            frequency: form.complianceMsme.frequency,
          },
        },
        dueDateOverrides: [],
        tags: [],
      };

      dto.notificationPreferences = {
        defaultChannels: form.notifChannels,
        language: form.notifLanguage,
        timezone: form.notifTimezone,
        quietHours: {
          enabled: form.quietHoursEnabled,
          start: form.quietHoursStart,
          end: form.quietHoursEnd,
        },
      };

      const selectedStaff = staffList.find(
        (staff) => staff.id === form.assignedTeam?.primaryAssigneeId,
      );
      if (selectedStaff) {
        const displayName =
          `${selectedStaff.firstName ?? ''} ${selectedStaff.lastName ?? ''}`.trim() ||
          selectedStaff.userName ||
          '';
        dto.assignedTeam = {
          primaryAssignee: {
            userId: selectedStaff.id,
            name: displayName,
          },
        };
      }

      dto.notes = notes.trim() ? [{ text: notes.trim() }] : [];

      await createSubject(businessId, dto);
      setSuccessMessage('Client created successfully!');
      setTimeout(() => {
        setForm(DEFAULT_FORM);
        setNotes('');
        onSuccess?.();
        handleClose();
      }, 700);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={handleClose}
        eyebrow="CLIENT MANAGEMENT"
        title="Add Client"
        icon={<UserRoundPlus className="h-5 w-5 text-white" />}
        width="lg"
        onSubmit={handleSubmit}
        onCancel={handleClose}
        cancelLabel="Cancel"
        submitLabel="Save Client"
        submitting={loading}
      >
        <div className="space-y-5">
          {/* Success Banner */}
          {successMessage && (
            <div
              role="status"
              className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-sm font-medium"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* API Error Banner */}
          {apiError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 text-sm font-medium"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                <span className="break-words">{apiError}</span>
              </div>
              <button
                type="button"
                onClick={() => setApiError('')}
                className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── Section 1: Client Information (Required) ────────────────── */}
          <DrawerSection step={1} title="Client Information" required>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrap label="Full Name" required error={errors.fullName}>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                  <input
                    className={`${INPUT} pl-10`}
                    placeholder="e.g. Rama Rao"
                    value={form.fullName}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, fullName: e.target.value }));
                      setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                  />
                </div>
              </FieldWrap>

              <FieldWrap label="Phone" required error={errors.phone}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                  <input
                    className={`${INPUT} pl-10`}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setForm((prev) => ({ ...prev, phone: value }));
                        setErrors((prev) => ({ ...prev, phone: '' }));
                      }
                    }}
                  />
                </div>
              </FieldWrap>

              <FieldWrap label="Email" required error={errors.email}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                  <input
                    type="email"
                    className={`${INPUT} pl-10`}
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, email: e.target.value }));
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                  />
                </div>
              </FieldWrap>

              <FieldWrap label="Business Name" required error={errors.companyName}>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                  <input
                    className={`${INPUT} pl-10`}
                    placeholder="e.g. Rama Traders"
                    value={form.companyName}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, companyName: e.target.value }));
                      setErrors((prev) => ({ ...prev, companyName: '' }));
                    }}
                  />
                </div>
              </FieldWrap>
            </div>
          </DrawerSection>

          {/* ── Section 2: Identifiers (Collapsible) ─────────────────────── */}
          <DrawerSection
            step={2}
            title="Identifiers"
            subtitle="PAN, GSTIN, TAN"
            collapsible
            defaultExpanded={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrap label="PAN">
                <input
                  className={INPUT}
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                  value={form.pan}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, pan: e.target.value.toUpperCase() }))
                  }
                />
              </FieldWrap>

              <FieldWrap label="GSTIN">
                <input
                  className={INPUT}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  maxLength={15}
                  value={form.gstins[0]?.gstin || ''}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setForm((prev) => {
                      const gstins = [...prev.gstins];
                      if (gstins.length === 0) {
                        gstins.push({
                          gstin: value,
                          state: '',
                          registrationType: 'REGULAR',
                          status: 'ACTIVE',
                        });
                      } else {
                        gstins[0] = { ...gstins[0], gstin: value };
                      }
                      return { ...prev, gstins };
                    });
                  }}
                />
              </FieldWrap>

              <FieldWrap label="TAN">
                <input
                  className={INPUT}
                  placeholder="e.g. ABCD12345E"
                  maxLength={10}
                  value={form.tan}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tan: e.target.value.toUpperCase() }))
                  }
                />
              </FieldWrap>
            </div>
          </DrawerSection>

          {/* ── Section 3: Compliance Services (Collapsible, open by default) ── */}
          <DrawerSection
            step={3}
            title="Compliance Services"
            subtitle="Active schedules"
            collapsible
            defaultExpanded={true}
          >
            <div className="space-y-3">
              {COMPLIANCE_ITEMS.map(({ key, label, code, icon, color }) => {
                const item = form[key];
                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl border border-divider bg-bg/40 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${color}`}
                        >
                          {icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-txt-main">{label}</p>
                          <p className="text-xs text-txt-sub">
                            {item.enabled
                              ? `${code} · ${item.frequency || 'Select frequency'}`
                              : `${code} · Inactive`}
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span
                          className={`text-xs font-semibold ${
                            item.enabled
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-txt-sub'
                          }`}
                        >
                          {item.enabled ? 'Active' : 'Inactive'}
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-success toggle-sm"
                          checked={item.enabled}
                          onChange={(e) =>
                            setCompliance(
                              key as keyof typeof form,
                              'enabled',
                              e.target.checked,
                            )
                          }
                        />
                      </label>
                    </div>

                    {item.enabled && (
                      <div className="mt-3 pt-3 border-t border-divider/60">
                        <label className="text-xs font-bold text-txt-main mb-1.5 block">
                          Select Filing Frequency
                        </label>
                        <div className="relative">
                          <select
                            className={SELECT}
                            value={item.frequency || ''}
                            onChange={(e) =>
                              setCompliance(
                                key as keyof typeof form,
                                'frequency',
                                e.target.value,
                              )
                            }
                          >
                            <option value="" disabled>
                              Select Filing Frequency
                            </option>
                            <option value="MONTHLY" className="bg-surface">
                              Monthly
                            </option>
                            <option value="QUARTERLY" className="bg-surface">
                              Quarterly
                            </option>
                            <option value="ANNUAL" className="bg-surface">
                              Annual
                            </option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DrawerSection>

          {/* ── Section 4: Addresses (Collapsible) ───────────────────────── */}
          <DrawerSection
            step={4}
            title="Addresses"
            subtitle="Registered / Communication"
            collapsible
            defaultExpanded={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrap label="Address Type">
                <div className="relative">
                  <select
                    className={SELECT}
                    value={form.addresses[0]?.type || 'REGISTERED'}
                    onChange={(e) => {
                      const value = e.target.value as AddressType;
                      setForm((prev) => {
                        const addresses = [...prev.addresses];
                        if (addresses.length === 0) {
                          addresses.push({
                            type: value,
                            line1: '',
                            city: '',
                            state: '',
                            pincode: '',
                          });
                        } else {
                          addresses[0] = { ...addresses[0], type: value };
                        }
                        return { ...prev, addresses };
                      });
                    }}
                  >
                    <option value="REGISTERED" className="bg-surface">
                      Registered
                    </option>
                    <option value="COMMUNICATION" className="bg-surface">
                      Communication
                    </option>
                    <option value="BRANCH" className="bg-surface">
                      Branch
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>
              </FieldWrap>

              <FieldWrap label="Address Line">
                <input
                  className={INPUT}
                  placeholder="Door No, Street Name"
                  value={form.addresses[0]?.line1 || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => {
                      const addresses = [...prev.addresses];
                      if (addresses.length === 0) {
                        addresses.push({
                          type: 'REGISTERED',
                          line1: value,
                          city: '',
                          state: '',
                          pincode: '',
                        });
                      } else {
                        addresses[0] = { ...addresses[0], line1: value };
                      }
                      return { ...prev, addresses };
                    });
                  }}
                />
              </FieldWrap>

              <FieldWrap label="City">
                <input
                  className={INPUT}
                  placeholder="e.g. Hyderabad"
                  value={form.addresses[0]?.city || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => {
                      const addresses = [...prev.addresses];
                      if (addresses.length === 0) {
                        addresses.push({
                          type: 'REGISTERED',
                          line1: '',
                          city: value,
                          state: '',
                          pincode: '',
                        });
                      } else {
                        addresses[0] = { ...addresses[0], city: value };
                      }
                      return { ...prev, addresses };
                    });
                  }}
                />
              </FieldWrap>

              <FieldWrap label="State">
                <input
                  className={INPUT}
                  placeholder="e.g. Telangana"
                  value={form.addresses[0]?.state || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => {
                      const addresses = [...prev.addresses];
                      if (addresses.length === 0) {
                        addresses.push({
                          type: 'REGISTERED',
                          line1: '',
                          city: '',
                          state: value,
                          pincode: '',
                        });
                      } else {
                        addresses[0] = { ...addresses[0], state: value };
                      }
                      return { ...prev, addresses };
                    });
                  }}
                />
              </FieldWrap>

              <FieldWrap label="Pincode">
                <input
                  className={INPUT}
                  placeholder="e.g. 500001"
                  maxLength={6}
                  value={form.addresses[0]?.pincode || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => {
                      const addresses = [...prev.addresses];
                      if (addresses.length === 0) {
                        addresses.push({
                          type: 'REGISTERED',
                          line1: '',
                          city: '',
                          state: '',
                          pincode: value,
                        });
                      } else {
                        addresses[0] = { ...addresses[0], pincode: value };
                      }
                      return { ...prev, addresses };
                    });
                  }}
                />
              </FieldWrap>
            </div>
          </DrawerSection>

          {/* ── Section 5: Notification Preferences (Collapsible) ───────── */}
          <DrawerSection
            step={5}
            title="Notification Preferences"
            subtitle="Channels"
            collapsible
            defaultExpanded={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  channel: 'WHATSAPP' as const,
                  label: 'WhatsApp',
                  desc: 'Automated due date alerts & reminders',
                  icon: <WhatsAppIcon className="h-5 w-5 text-emerald-500 shrink-0" />,
                },
                {
                  channel: 'EMAIL' as const,
                  label: 'Email',
                  desc: 'Filing summaries & official notifications',
                  icon: <Mail className="h-5 w-5 text-blue-500 shrink-0" />,
                },
              ].map(({ channel, label, desc, icon }) => {
                const isChecked = form.notifChannels.includes(channel);
                return (
                  <label
                    key={channel}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20'
                        : 'border-divider bg-bg/40 hover:bg-surface'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm mt-0.5 rounded-md"
                      checked={isChecked}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          notifChannels: e.target.checked
                            ? [...prev.notifChannels, channel]
                            : prev.notifChannels.filter((item) => item !== channel),
                        }))
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="text-xs font-bold text-txt-main">{label}</span>
                      </div>
                      <p className="text-[11px] text-txt-sub mt-0.5">{desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </DrawerSection>

          {/* ── Section 6: Assign Team (Collapsible) ─────────────────────── */}
          <DrawerSection
            step={6}
            title="Assign Team"
            subtitle="Primary staff member"
            collapsible
            defaultExpanded={false}
          >
            <FieldWrap label="Staff Member">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    className={SELECT}
                    value={form.assignedTeam?.primaryAssigneeId || ''}
                    disabled={loadingStaff}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__add_new__') {
                        setOpenCreateStaff(true);
                        return;
                      }
                      const selected = staffList.find((staff) => staff.id === val);
                      setForm((prev) => ({
                        ...prev,
                        assignedTeam: {
                          primaryAssigneeId: val,
                          primaryAssigneeName: selected?.userName || '',
                        },
                      }));
                    }}
                  >
                    <option value="">Select staff</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id} className="bg-surface">
                        {staff.firstName && staff.lastName
                          ? `${staff.firstName} ${staff.lastName}`
                          : staff.userName ?? 'Unnamed'}
                      </option>
                    ))}
                    <option
                      value="__add_new__"
                      className="bg-surface font-semibold text-blue-600"
                    >
                      + Add new staff
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-txt-sub" />
                </div>

                <button
                  type="button"
                  onClick={() => setOpenCreateStaff(true)}
                  className="h-11 px-3.5 rounded-xl border border-divider bg-bg/50 hover:bg-surface text-txt-main text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs hover:border-blue-500/40"
                  title="Add new staff member"
                >
                  <Plus className="h-4 w-4 text-blue-500" />
                  <span className="hidden sm:inline">Add Staff</span>
                </button>
              </div>
            </FieldWrap>
          </DrawerSection>

          {/* ── Section 7: Internal Notes (Collapsible) ─────────────────── */}
          <DrawerSection
            step={7}
            title="Internal Notes"
            subtitle="Team comments"
            collapsible
            defaultExpanded={false}
          >
            <FieldWrap label="Notes">
              <textarea
                rows={3}
                className={TEXTAREA}
                placeholder="Add any internal team notes about this client..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FieldWrap>
          </DrawerSection>
        </div>
      </Drawer>

      {/* Add Staff Modal Modal */}
      <AddStaffDialog
        open={openCreateStaff}
        onClose={() => setOpenCreateStaff(false)}
        businessId={businessId}
        onSuccess={async (newStaff?: StaffMember) => {
          setOpenCreateStaff(false);
          await fetchStaff();
          if (newStaff?.id) {
            setForm((previous) => ({
              ...previous,
              assignedTeam: {
                primaryAssigneeId: newStaff.id,
                primaryAssigneeName:
                  `${newStaff.firstName ?? ''} ${newStaff.lastName ?? ''}`.trim() ||
                  newStaff.userName ||
                  '',
              },
            }));
          }
        }}
      />
    </>
  );
}
