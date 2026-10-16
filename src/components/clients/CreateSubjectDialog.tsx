"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  UserRoundPlus,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  UserRound,
  Phone,
  Mail,
  Building2,
  FileText,
  MapPin,
  Bell,
  Users,
  ClipboardList,
  Plus,
} from "lucide-react";

import { createSubject } from "@/services/subjectService";
import { DEFAULT_FORM } from "@/constants/clientConstants";
import type { CreateSubjectDto, AddressType } from "@/types/subject";
import { getStaff } from "@/services/staffService";
import type { StaffMember } from "@/types/staff.types";
import AddStaffDialog from "../staff/AddStaffDialog";

interface Props {
  businessId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SectionKey = "identifiers" | "compliance" | "addresses" | "notifications" | "team" | "notes";

function StaticLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children}
      {required && <span className="ml-1 text-error">*</span>}
    </label>
  );
}

const inputClass =
  "input input-bordered w-full rounded-xl bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20";
const selectClass =
  "select select-bordered w-full rounded-xl bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20";
const sectionClass = "overflow-hidden rounded-2xl border border-base-300 bg-base-100";

export default function CreateSubjectDialog({
  businessId,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    email: "",
    companyName: "",
  });

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [openCreateStaff, setOpenCreateStaff] = useState(false);
  const [notes, setNotes] = useState("");
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    identifiers: false,
    compliance: true,
    addresses: false,
    notifications: false,
    team: false,
    notes: false,
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoadingStaff(true);
      const data = await getStaff(businessId);
      setStaffList(data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    } finally {
      setLoadingStaff(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (open) fetchStaff();
  }, [open, fetchStaff]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // handleClose intentionally uses current render state for drawer dismissal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  function setCompliance(
    key: keyof typeof form,
    field: "enabled" | "frequency",
    value: boolean | string,
  ) {
    setForm((prev) => {
      const current = prev[key];
      if (typeof current !== "object") return prev;
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
      setNotes("");
      setApiError("");
      setSuccessMessage("");
      setErrors({ fullName: "", phone: "", email: "", companyName: "" });
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      phone: "",
      email: "",
      companyName: "",
    };

    if (!form.fullName.trim()) newErrors.fullName = "Please enter full name";

    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!form.email.trim()) {
      newErrors.email = "Please enter email address";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.companyName.trim()) {
      newErrors.companyName = "Please enter business name";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const isFormValid = () =>
    Boolean(
      form.fullName.trim() &&
        form.phone.trim() &&
        form.email.trim() &&
        /\S+@\S+\.\S+/.test(form.email) &&
        form.companyName.trim(),
    );

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setApiError("");

      const dto: CreateSubjectDto = {
        subjectType: "CLIENT",
        profile: {
          displayName: form.fullName,
          businessName: form.companyName || form.fullName,
          legalName: form.companyName || form.fullName,
          constitution: "INDIVIDUAL",
          industry: "General",
          businessNature: ["General"],
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
        (gstin) => gstin.gstin && gstin.gstin.trim() !== "",
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
          `${selectedStaff.firstName ?? ""} ${selectedStaff.lastName ?? ""}`.trim() ||
          selectedStaff.userName ||
          "";
        dto.assignedTeam = {
          primaryAssignee: {
            userId: selectedStaff.id,
            name: displayName,
          },
        };
      }

      dto.notes = notes.trim() ? [{ text: notes.trim() }] : [];

      await createSubject(businessId, dto);
      setSuccessMessage("Client created successfully!");
      setTimeout(() => {
        setForm(DEFAULT_FORM);
        setNotes("");
        onSuccess?.();
        handleClose();
      }, 1000);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: SectionKey) =>
    setExpanded((previous) => ({ ...previous, [section]: !previous[section] }));

  const renderSectionHeader = (
    section: SectionKey,
    title: string,
    icon: React.ReactNode,
  ) => (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-base-200/60"
      onClick={() => toggleSection(section)}
      aria-expanded={expanded[section]}
    >
      <span className="flex items-center gap-3 text-sm font-bold text-base-content">
        <span className="text-primary">{icon}</span>
        {title}
      </span>
      {expanded[section] ? (
        <ChevronUp className="h-4 w-4 shrink-0 text-base-content/60" />
      ) : (
        <ChevronDown className="h-4 w-4 shrink-0 text-base-content/60" />
      )}
    </button>
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80]">
        <button
          type="button"
          aria-label="Close create client drawer"
          className="absolute inset-0 h-full w-full cursor-default bg-slate-950/45 backdrop-blur-[2px]"
          onClick={handleClose}
          disabled={loading}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-client-title"
          className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-base-300 bg-base-100 shadow-2xl animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-base-300 bg-base-100 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Client management
                </p>
                <h2 id="create-client-title" className="text-lg font-bold text-base-content">
                  Add Client
                </h2>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-square btn-sm"
              aria-label="Close"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
            <div className="space-y-4">
              {successMessage && (
                <div role="status" className="alert alert-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{successMessage}</span>
                </div>
              )}
              {apiError && (
                <div role="alert" className="alert alert-error">
                  <AlertCircle className="h-5 w-5" />
                  <span>{apiError}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    aria-label="Dismiss error"
                    onClick={() => setApiError("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Required client information */}
              <section className={`${sectionClass} p-5`}>
                <div className="mb-4 flex items-center gap-2 border-b border-base-200 pb-3">
                  <UserRound className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-base-content">
                    Client information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <StaticLabel required>Full Name</StaticLabel>
                    <input
                      className={inputClass}
                      placeholder="Enter full name (e.g., Rama Rao)"
                      value={form.fullName}
                      onChange={(event) => {
                        setForm((previous) => ({ ...previous, fullName: event.target.value }));
                        setErrors((previous) => ({ ...previous, fullName: "" }));
                      }}
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-error">{errors.fullName}</p>}
                  </div>
                  <div>
                    <StaticLabel required>Phone</StaticLabel>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                      <input
                        className={`${inputClass} pl-9`}
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                        value={form.phone}
                        onChange={(event) => {
                          const value = event.target.value.replace(/\D/g, "");
                          if (value.length <= 10) {
                            setForm((previous) => ({ ...previous, phone: value }));
                            setErrors((previous) => ({ ...previous, phone: "" }));
                          }
                        }}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
                  </div>
                  <div>
                    <StaticLabel required>Email</StaticLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                      <input
                        className={`${inputClass} pl-9`}
                        type="email"
                        placeholder="name@example.com"
                        value={form.email}
                        onChange={(event) => {
                          setForm((previous) => ({ ...previous, email: event.target.value }));
                          setErrors((previous) => ({ ...previous, email: "" }));
                        }}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
                  </div>
                  <div>
                    <StaticLabel required>Business Name</StaticLabel>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
                      <input
                        className={`${inputClass} pl-9`}
                        placeholder="e.g., Rama Traders"
                        value={form.companyName}
                        onChange={(event) => {
                          setForm((previous) => ({ ...previous, companyName: event.target.value }));
                          setErrors((previous) => ({ ...previous, companyName: "" }));
                        }}
                      />
                    </div>
                    {errors.companyName && <p className="mt-1 text-xs text-error">{errors.companyName}</p>}
                  </div>
                </div>
              </section>

              {/* Identifiers */}
              <section className={sectionClass}>
                {renderSectionHeader("identifiers", "Identifiers (Recommended)", <FileText className="h-4 w-4" />)}
                {expanded.identifiers && (
                  <div className="grid grid-cols-1 gap-4 border-t border-base-200 p-5 sm:grid-cols-2">
                    <div>
                      <StaticLabel>PAN</StaticLabel>
                      <input
                        className={inputClass}
                        placeholder="e.g., ABCDE1234F"
                        value={form.pan}
                        onChange={(event) => setForm((previous) => ({ ...previous, pan: event.target.value.toUpperCase() }))}
                      />
                    </div>
                    <div>
                      <StaticLabel>GSTIN</StaticLabel>
                      <input
                        className={inputClass}
                        placeholder="e.g., 22AAAAA0000A1Z5"
                        value={form.gstins[0]?.gstin || ""}
                        onChange={(event) => {
                          const value = event.target.value.toUpperCase();
                          setForm((previous) => {
                            const gstins = [...previous.gstins];
                            if (gstins.length === 0) {
                              gstins.push({ gstin: value, state: "", registrationType: "REGULAR", status: "ACTIVE" });
                            } else {
                              gstins[0] = { ...gstins[0], gstin: value };
                            }
                            return { ...previous, gstins };
                          });
                        }}
                      />
                    </div>
                    <div>
                      <StaticLabel>TAN</StaticLabel>
                      <input
                        className={inputClass}
                        placeholder="e.g., ABCD12345E"
                        value={form.tan}
                        onChange={(event) => setForm((previous) => ({ ...previous, tan: event.target.value.toUpperCase() }))}
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Compliance services */}
              <section className={sectionClass}>
                {renderSectionHeader("compliance", "Compliance Services", <ClipboardList className="h-4 w-4" />)}
                {expanded.compliance && (
                  <div className="space-y-3 border-t border-base-200 p-4">
                    {(
                      [
                        { key: "complianceGst", label: "GST", icon: "📋" },
                        { key: "complianceTds", label: "TDS", icon: "🏦" },
                        { key: "complianceItr", label: "ITR", icon: "📄" },
                        { key: "complianceRoc", label: "ROC", icon: "🏢" },
                        { key: "complianceMsme", label: "MSME", icon: "🏭" },
                      ] as const
                    ).map(({ key, label, icon }) => (
                      <div key={key} className="rounded-xl border border-base-300 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
                              {icon}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-base-content">{label}</p>
                              <p className="text-xs text-base-content/60">
                                {form[key].enabled ? `${label} · Select Frequency` : `${label} · Inactive`}
                              </p>
                            </div>
                          </div>
                          <label className="flex cursor-pointer items-center gap-2">
                            <span className={`text-xs font-semibold ${form[key].enabled ? "text-success" : "text-base-content/50"}`}>
                              {form[key].enabled ? "Active" : "Inactive"}
                            </span>
                            <input
                              type="checkbox"
                              className="toggle toggle-success"
                              checked={form[key].enabled}
                              onChange={(event) => setCompliance(key as keyof typeof form, "enabled", event.target.checked)}
                            />
                          </label>
                        </div>
                        {form[key].enabled && (
                          <div className="mt-4">
                            <StaticLabel>Select Filing Frequency</StaticLabel>
                            <select
                              className={selectClass}
                              value={form[key].frequency || ""}
                              onChange={(event) =>
                                setCompliance(
                                  key as "complianceGst" | "complianceTds" | "complianceItr" | "complianceRoc" | "complianceMsme",
                                  "frequency",
                                  event.target.value,
                                )
                              }
                            >
                              <option value="" disabled>Select Filing Frequency</option>
                              <option value="MONTHLY">Monthly</option>
                              <option value="QUARTERLY">Quarterly</option>
                              <option value="ANNUAL">Annual</option>
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Address */}
              <section className={sectionClass}>
                {renderSectionHeader("addresses", "Addresses", <MapPin className="h-4 w-4" />)}
                {expanded.addresses && (
                  <div className="grid grid-cols-1 gap-4 border-t border-base-200 p-5 sm:grid-cols-2">
                    <div>
                      <StaticLabel>Address Type</StaticLabel>
                      <select
                        className={selectClass}
                        value={form.addresses[0]?.type || "REGISTERED"}
                        onChange={(event) => {
                          const value = event.target.value as AddressType;
                          setForm((previous) => {
                            const addresses = [...previous.addresses];
                            if (addresses.length === 0) {
                              addresses.push({ type: value, line1: "", city: "", state: "", pincode: "" });
                            } else {
                              addresses[0] = { ...addresses[0], type: value };
                            }
                            return { ...previous, addresses };
                          });
                        }}
                      >
                        <option value="REGISTERED">Registered</option>
                        <option value="COMMUNICATION">Communication</option>
                        <option value="BRANCH">Branch</option>
                      </select>
                    </div>
                    {(
                      [
                        { key: "line1", label: "Address Line", placeholder: "Door No, Street Name" },
                        { key: "city", label: "City", placeholder: "e.g., Hyderabad" },
                        { key: "state", label: "State", placeholder: "e.g., Telangana" },
                        { key: "pincode", label: "Pincode", placeholder: "e.g., 500001" },
                      ] as const
                    ).map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <StaticLabel>{label}</StaticLabel>
                        <input
                          className={inputClass}
                          placeholder={placeholder}
                          value={form.addresses[0]?.[key] || ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            setForm((previous) => {
                              const addresses = [...previous.addresses];
                              if (addresses.length === 0) {
                                addresses.push({
                                  type: "REGISTERED",
                                  line1: key === "line1" ? value : "",
                                  city: key === "city" ? value : "",
                                  state: key === "state" ? value : "",
                                  pincode: key === "pincode" ? value : "",
                                });
                              } else {
                                addresses[0] = { ...addresses[0], [key]: value };
                              }
                              return { ...previous, addresses };
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Notification preferences */}
              <section className={sectionClass}>
                {renderSectionHeader("notifications", "Notification Preferences", <Bell className="h-4 w-4" />)}
                {expanded.notifications && (
                  <div className="border-t border-base-200 p-5">
                    <StaticLabel>Channels</StaticLabel>
                    <div className="flex flex-wrap gap-3">
                      {(["WHATSAPP", "EMAIL"] as const).map((channel) => (
                        <label key={channel} className="flex cursor-pointer items-center gap-3 rounded-xl border border-base-300 px-4 py-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={form.notifChannels.includes(channel)}
                            onChange={(event) =>
                              setForm((previous) => ({
                                ...previous,
                                notifChannels: event.target.checked
                                  ? [...previous.notifChannels, channel]
                                  : previous.notifChannels.filter((item) => item !== channel),
                              }))
                            }
                          />
                          <span className="text-sm font-semibold">{channel === "WHATSAPP" ? "WhatsApp" : "Email"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Assign team */}
              <section className={sectionClass}>
                {renderSectionHeader("team", "Assign Team", <Users className="h-4 w-4" />)}
                {expanded.team && (
                  <div className="border-t border-base-200 p-5">
                    <StaticLabel>Select Staff</StaticLabel>
                    {loadingStaff ? (
                      <div className="flex items-center gap-2 py-2 text-sm text-base-content/60">
                        <LoaderCircle className="h-4 w-4 animate-spin" /> Loading staff...
                      </div>
                    ) : (
                      <>
                        <select
                          className={selectClass}
                          value={form.assignedTeam?.primaryAssigneeId || ""}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value === "__add_new__") {
                              setOpenCreateStaff(true);
                              return;
                            }
                            const selected = staffList.find((staff) => staff.id === value);
                            setForm((previous) => ({
                              ...previous,
                              assignedTeam: {
                                primaryAssigneeId: value,
                                primaryAssigneeName: selected?.userName || "",
                              },
                            }));
                          }}
                        >
                          <option value="">Select staff</option>
                          {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.firstName && staff.lastName
                                ? `${staff.firstName} ${staff.lastName}`
                                : staff.userName ?? "Unnamed"}
                            </option>
                          ))}
                          <option value="__add_new__">+ Add new staff</option>
                        </select>
                        {staffList.length === 0 && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm mt-3 gap-2"
                            onClick={() => setOpenCreateStaff(true)}
                          >
                            <Plus className="h-4 w-4" /> Add Staff
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>

              {/* Internal notes */}
              <section className={sectionClass}>
                {renderSectionHeader("notes", "Add Internal Notes", <FileText className="h-4 w-4" />)}
                {expanded.notes && (
                  <div className="border-t border-base-200 p-5">
                    <StaticLabel>Internal Notes</StaticLabel>
                    <textarea
                      className="textarea textarea-bordered min-h-28 w-full rounded-xl bg-base-100"
                      placeholder="Add any internal notes about this client"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Sticky footer */}
          <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-base-300 bg-base-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              className="btn btn-outline sm:min-w-32"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary gap-2 sm:min-w-44"
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Client"
              )}
            </button>
          </footer>
        </aside>
      </div>

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
                  `${newStaff.firstName ?? ""} ${newStaff.lastName ?? ""}`.trim() ||
                  newStaff.userName ||
                  "",
              },
            }));
          }
        }}
      />
    </>
  );
}
