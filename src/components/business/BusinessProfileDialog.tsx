"use client";

import { useState } from "react";
import { z } from "zod";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Tag,
  MapPin,
  Clock,
  Edit2,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Business, BusinessType, UpdateBusinessDto } from "@/types/business";
import { getOrganizations } from "@/services/organizationService";
import { getBusinessById, getBusinesses, updateBusiness } from "@/services/businessService";
import { BUSINESS_TYPE_OPTIONS } from "@/constants/businessConstants";
import { ModalWrapper } from "../wrappers/ModalWrapper";
import { FormWrapper } from "../wrappers/FormWrapper";
import { InputField } from "../ui/InputField";
import { SelectField } from "../ui/SelectField";
import { TextareaField } from "../ui/TextareaField";

interface BusinessProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const BUSINESS_FORM_ID = "business-profile-form";

// ─── Validation schema for the edit form ──────────────────────────────────
const businessProfileSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  ownerName: z.string().optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => /^[0-9]{10}$/.test(val), "Enter a 10-digit mobile number"),
  businessType: z.string().min(1, "Select a category"),
  line1: z.string().optional().or(z.literal("")),
  area: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  pincode: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^[0-9]{1,6}$/.test(val), "Pincode must be up to 6 digits"),
  country: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

// ─── Helper InfoRow Component for View Mode ──────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-b-0">
      <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-xs text-[var(--text-secondary)] font-medium">{label}</div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">{value || "—"}</div>
      </div>
    </div>
  );
}

export default function BusinessProfileDialog({ open, onClose }: BusinessProfileDialogProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [orgId, setOrgId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      setError("");

      const orgs = await getOrganizations();
      if (!orgs.length) {
        setError("No organization found.");
        return;
      }
      const organizationId = orgs[0].id;
      setOrgId(organizationId);

      const businesses = await getBusinesses(organizationId);
      if (!businesses.length) {
        setError("No business found.");
        return;
      }
      const businessId = businesses[0].id;

      const biz = await getBusinessById(organizationId, businessId);
      setBusiness(biz);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load business");
    } finally {
      setLoading(false);
    }
  };

  if (open && !business && !loading && !error) {
    fetchBusiness();
  }

  const getDefaultValues = (biz: Business): BusinessProfileFormValues => ({
    name: biz.name || "",
    ownerName: biz.settings?.uiConfig?.ownerName || "",
    email: biz.settings?.uiConfig?.email || "",
    phone: biz.phone || "",
    businessType: biz.businessType || "OTHER",
    line1: biz.address?.line1 || "",
    area: biz.address?.area || "",
    city: biz.address?.city || "",
    state: biz.address?.state || "",
    pincode: biz.address?.pincode || "",
    country: biz.address?.country || "IN",
    notes: biz.notes || "",
  });

  const handleSubmit = async (values: BusinessProfileFormValues) => {
    if (!business) return;
    try {
      setSubmitting(true);
      setError("");

      const payload: UpdateBusinessDto = {
        name: values.name,
        phone: values.phone,
        businessType: values.businessType as BusinessType,
        notes: values.notes,
        address: {
          type: "REGISTERED",
          line1: values.line1 || "",
          area: values.area || "",
          city: values.city || "",
          state: values.state || "",
          pincode: values.pincode || "",
          country: values.country || "IN",
        },
        uiConfig: {
          ownerName: values.ownerName || "",
          email: values.email || "",
        },
      };

      await updateBusiness(orgId, business.id, payload);
      await fetchBusiness();
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update business");
    } finally {
      setSubmitting(false);
    }
  };

  const getAddressString = (biz: Business) =>
    [biz.address?.line1, biz.address?.area, biz.address?.city, biz.address?.state, biz.address?.pincode, biz.address?.country]
      .filter(Boolean)
      .join(", ");

  const getTypeLabel = (value: string) =>
    BUSINESS_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;

  const handleClose = () => {
    setIsEditing(false);
    setBusiness(null);
    setError("");
    onClose();
  };

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      fullWidth
      widthVw={60}
      heightVh={80}
      header={
        <div className="flex justify-between items-center bg-[#0B1220] text-white px-6 py-4 shrink-0 border-b-2 border-[var(--accent)]/40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-[var(--accent)] flex items-center justify-center font-bold">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">Business Profile</h3>
              <p className="text-xs text-white/70">Organization details & settings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-50 flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
      }
      actions={
        isEditing ? (
          <div className="flex items-center justify-end w-full">
            <button
              type="submit"
              form={BUSINESS_FORM_ID}
              disabled={submitting}
              className="h-11 px-7 text-sm font-bold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[#0B1220] shadow-md rounded-xl cursor-pointer border-none flex items-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        ) : undefined
      }
    >
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
        </div>
      ) : error ? (
        <div role="alert" className="alert alert-error mb-5 py-3 rounded-xl border border-red-200 dark:border-red-900 shadow-sm">
          <span className="flex-1 text-sm font-medium">{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="btn btn-xs btn-circle btn-ghost"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {!loading && business && (
        <div className="space-y-6">
          {/* ── Brand Business Profile Hero Card ── */}
          <div className="bg-gradient-to-r from-[#0B1220] to-[#16223D] text-white border border-[var(--accent)]/30 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[var(--accent)]/10 blur-xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/15 border-2 border-[var(--accent)] text-[var(--accent)] font-extrabold flex items-center justify-center shadow-md shrink-0">
                <Building2 size={30} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-white tracking-tight">{business.name}</h2>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    business.isActive
                      ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40"
                      : "bg-white/20 text-white/80 border border-white/30"
                  }`}>
                    <CheckCircle2 size={12} />
                    {business.isActive ? "Active Business" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} className="text-[var(--accent)]" />
                    {getTypeLabel(business.businessType)}
                  </span>
                  {business.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-[var(--accent)]" />
                      {business.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-10 px-5 text-xs font-bold border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#0B1220] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer relative z-10"
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            )}
          </div>

          {/* ════════════ VIEW MODE ════════════ */}
          {!isEditing && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Core Details */}
              <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                    <Building2 size={16} className="text-[var(--accent)]" />
                    Business Details
                  </h4>
                  <div className="flex flex-col gap-1">
                    <InfoRow icon={Building2} label="Business Name" value={business.name} />
                    <InfoRow icon={User} label="Owner Name" value={business.settings?.uiConfig?.ownerName} />
                    <InfoRow icon={Mail} label="Business Email" value={business.settings?.uiConfig?.email} />
                    <InfoRow icon={Phone} label="Business Phone" value={business.phone} />
                    <InfoRow icon={Tag} label="Business Category" value={getTypeLabel(business.businessType)} />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Location & System Info */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
                  <h4 className="font-bold text-sm text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                    <MapPin size={16} className="text-[var(--accent)]" />
                    Location & Address
                  </h4>
                  <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                    {getAddressString(business) || "No address specified."}
                  </p>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex-1">
                  <h4 className="font-bold text-sm text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                    <Clock size={16} className="text-[var(--accent)]" />
                    System Preferences
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)] font-medium">Timezone</span>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {business.settings?.timezone || "Asia/Kolkata"}
                      </span>
                    </div>
                    {business.notes && (
                      <div className="pt-2 border-t border-[var(--border)]">
                        <span className="text-xs text-[var(--text-secondary)] font-medium block mb-1">Notes</span>
                        <p className="text-xs text-[var(--text-primary)] bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--border)]">
                          {business.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ EDIT MODE ════════════ */}
          {isEditing && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Edit2 size={16} className="text-[var(--accent)]" />
                  Edit Business Information
                </h4>
                <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/20">Editing Mode</span>
              </div>

              <FormWrapper
                key={business.id}
                formId={BUSINESS_FORM_ID}
                schema={businessProfileSchema}
                defaultValues={getDefaultValues(business)}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField name="name" label="Business Name" placeholder="e.g. Sri & Associates" icon={Building2} required />
                  <InputField name="ownerName" label="Owner Name" placeholder="Optional owner name" icon={User} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField name="email" label="Email" type="email" placeholder="business@example.com" icon={Mail} />
                  <InputField name="phone" label="Phone" placeholder="10-digit mobile" icon={Phone} maxLength={10} inputMode="numeric" required />
                </div>

                <SelectField
                  name="businessType"
                  label="Business Category"
                  options={BUSINESS_TYPE_OPTIONS}
                  required
                />

                {/* Address Section */}
                <div className="collapse collapse-arrow border border-[var(--border)] rounded-2xl bg-[var(--surface)]">
                  <input type="checkbox" defaultChecked />
                  <div className="collapse-title text-sm font-bold text-[var(--text-primary)] min-h-0 py-3 flex items-center gap-2">
                    <MapPin size={16} className="text-[var(--accent)]" />
                    Address Details
                  </div>
                  <div className="collapse-content flex flex-col gap-3 pt-2">
                    <InputField name="line1" label="Street / Line 1" placeholder="Building, street name" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InputField name="area" label="Area / Locality" placeholder="Optional area" />
                      <InputField name="city" label="City" placeholder="City" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <InputField name="state" label="State" placeholder="State" />
                      <InputField name="pincode" label="Pincode" placeholder="Up to 6 digits" maxLength={6} inputMode="numeric" />
                      <InputField name="country" label="Country" placeholder="IN" />
                    </div>
                  </div>
                </div>

                <TextareaField name="notes" label="Notes" placeholder="Optional business notes" rows={2} />
              </FormWrapper>
            </div>
          )}
        </div>
      )}
    </ModalWrapper>
  );
}