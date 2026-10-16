"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  X,
  Mail,
  AtSign,
  Phone,
  Edit2,
  Save,
  Calendar,
  Loader2,
  User as UserIcon,
  Clock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import type { User, UpdateUserDto } from "@/types/user";
import { ModalWrapper } from "../wrappers/ModalWrapper";
import { FormWrapper } from "../wrappers/FormWrapper";
import { InputField } from "../ui/InputField";
import { getCurrentUser, updateUser } from "@/services/userService";

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const USER_PROFILE_FORM_ID = "user-profile-form";

// ─── Zod Validation Schema ───────────────────────────────────────────────────
const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().or(z.literal("")),
  mobileNumber: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || val.length === 0 || /^[0-9]{10}$/.test(val),
      "Mobile number must be exactly 10 digits"
    ),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

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

export default function UserProfileDialog({ open, onClose }: UserProfileDialogProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch User Profile on Dialog Open ──────────────────────────────────────
  useEffect(() => {
    if (open) fetchUserProfile();
  }, [open]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCurrentUser();
      setUser(data);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: UserProfileFormValues) => {
    try {
      setSubmitting(true);
      setError("");

      const dto: UpdateUserDto = {
        ...(values.firstName && { firstName: values.firstName }),
        ...(values.lastName && { lastName: values.lastName }),
        ...(values.mobileNumber && { mobileNumber: values.mobileNumber }),
      };

      await updateUser(dto);
      await new Promise((r) => setTimeout(r, 300));
      await fetchUserProfile();
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setError("");
    onClose();
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const first = user.firstName?.[0] || user.username?.[0] || "";
    const last = user.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "?";
  };

  const getFullName = () => {
    if (!user) return "";
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : user.username;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDefaultValues = (u: User): UserProfileFormValues => ({
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    mobileNumber: u.mobileNumber || "",
  });

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
              <UserIcon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">User Profile</h3>
              <p className="text-xs text-white/70">Personal settings and account management</p>
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
              form={USER_PROFILE_FORM_ID}
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

      {!loading && user && (
        <div className="space-y-6">
          {/* ── Brand User Profile Hero Card ── */}
          <div className="bg-gradient-to-r from-[#0B1220] to-[#16223D] text-white border border-[var(--accent)]/30 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[var(--accent)]/10 blur-xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/15 border-2 border-[var(--accent)] text-[var(--accent)] font-extrabold flex items-center justify-center shadow-md shrink-0">
                <span className="text-xl tracking-wide">{getUserInitials()}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-white tracking-tight">{getFullName()}</h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40">
                    <ShieldCheck size={12} />
                    Verified User
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-[var(--accent)]" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AtSign size={13} className="text-[var(--accent)]" />
                    {user.username}
                  </span>
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

          {/* ── Main Two-Column Content Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Personal Information (Span 7) */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                  <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <UserIcon size={16} className="text-[var(--accent)]" />
                    Personal Information
                  </h4>
                  {isEditing && (
                    <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/20">Editing Mode</span>
                  )}
                </div>

                {!isEditing ? (
                  /* View Mode */
                  <div className="flex flex-col gap-1">
                    <InfoRow icon={UserIcon} label="First Name" value={user.firstName} />
                    <InfoRow icon={UserIcon} label="Last Name" value={user.lastName} />
                    <InfoRow icon={Phone} label="Mobile Number" value={user.mobileNumber} />
                    <InfoRow icon={Mail} label="Email Address" value={user.email} />
                    <InfoRow icon={AtSign} label="Username" value={user.username} />
                  </div>
                ) : (
                  /* Edit Mode with FormWrapper */
                  <FormWrapper
                    key={user.id}
                    formId={USER_PROFILE_FORM_ID}
                    schema={userProfileSchema}
                    defaultValues={getDefaultValues(user)}
                    onSubmit={handleSave}
                    className="space-y-4 pt-1"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        name="firstName"
                        label="First Name"
                        placeholder="Enter first name"
                        icon={UserIcon}
                        required
                      />
                      <InputField
                        name="lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                        icon={UserIcon}
                      />
                    </div>

                    <InputField
                      name="mobileNumber"
                      label="Mobile Number"
                      placeholder="10-digit mobile number"
                      icon={Phone}
                      maxLength={10}
                      inputMode="numeric"
                    />

                    <div>
                      <InputField
                        name="email"
                        label="Email Address (Read-only)"
                        placeholder={user.email}
                        value={user.email}
                        icon={Mail}
                        disabled
                      />
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 ml-0.5">
                        Email address is tied to your login identity and cannot be changed.
                      </p>
                    </div>
                  </FormWrapper>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Subscription & Account Info (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Subscription Card */}
              {user.razorpaySubscriptionData ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
                  <h4 className="font-bold text-sm text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                    <CreditCard size={16} className="text-[var(--accent)]" />
                    Subscription Plan
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)] font-medium">Status</span>
                      <span
                        className={`badge badge-sm font-semibold capitalize px-2.5 py-1 ${user.razorpaySubscriptionData.subscriptionStatus === "active"
                            ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40"
                            : "badge-ghost"
                          }`}
                      >
                        {user.razorpaySubscriptionData.subscriptionStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)] font-medium">Current Plan</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {user.razorpaySubscriptionData.planName || "Standard Plan"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1">
                        <Calendar size={13} />
                        Next Billing
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {formatDate(user.razorpaySubscriptionData.nextBillingDate)}
                      </span>
                    </div>

                    {user.razorpaySubscriptionData.paymentStatus && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-secondary)] font-medium">Payment Status</span>
                        <span className="text-xs font-semibold text-[var(--accent)]">
                          {user.razorpaySubscriptionData.paymentStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
                  <h4 className="font-bold text-sm text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                    <CreditCard size={16} className="text-[var(--accent)]" />
                    Subscription
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">No active paid subscription attached to this account.</p>
                </div>
              )}

              {/* Account Metadata Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex-1">
                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)] flex items-center gap-2">
                  <Clock size={16} className="text-[var(--accent)]" />
                  Account Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Member Since</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Last Profile Update</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {formatDate(user.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}