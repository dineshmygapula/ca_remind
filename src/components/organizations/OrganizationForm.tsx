"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Receipt,
  MapPin,
  ArrowLeft,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createOrganization } from "@/services/organizationService";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import EmailField from "@/components/common/EmailField";
import NameField from "@/components/common/NameField";
import { BillingMeta, OrganizationFormData } from "@/types/organizations";
import {
  INVOICE_PREFERENCES,
  EMPTY_FORM,
  EMPTY_BILLING_META,
} from "@/constants/organizationConstants";

export default function OrganizationForm() {
  const router = useRouter();
  const { refresh } = useWorkspace();
  const { user } = useAuth();

  const [formData, setFormData] = useState<OrganizationFormData>(EMPTY_FORM);
  const [billingMeta, setBillingMeta] = useState<BillingMeta>(EMPTY_BILLING_META);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => (prev.billingEmail ? prev : { ...prev, billingEmail: user.email ?? "" }));
    }
  }, [user]);

  const nameRegex = /^[A-Za-z0-9\s&.,'\-()]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isNameValid =
    formData.name.trim().length > 0 && nameRegex.test(formData.name.trim());
  const isEmailValid =
    formData.billingEmail.trim().length > 0 &&
    emailRegex.test(formData.billingEmail.trim());

  const isFormValid = isNameValid && isEmailValid;

  const handleBillingMetaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBillingMeta((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!isFormValid) return;

    try {
      setSubmitting(true);
      setError("");

      await createOrganization({
        name: formData.name.trim(),
        billingEmail: formData.billingEmail.trim(),
        planKey: "free",
        billingMeta: {
          ...(billingMeta.gstNumber.trim() && {
            gstNumber: billingMeta.gstNumber.trim(),
          }),
          ...(billingMeta.billingAddress.trim() && {
            billingAddress: billingMeta.billingAddress.trim(),
          }),
          ...(billingMeta.invoicePreference && {
            invoicePreference: billingMeta.invoicePreference,
          }),
        },
      });

      setSuccess(true);
      await refresh();
      setTimeout(() => router.push("/business-create"), 1000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
          <span>Step 2 of 3 · Organization</span>
          <span className="font-bold text-[var(--primary)]">100%</span>
        </div>
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
          <div className="h-1 bg-[var(--primary)] w-full transition-all duration-300" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[var(--heading)] tracking-tight">
                Create Organization
              </h1>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
            Only name and billing email are required. You can add GST and full billing address later in organization settings.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Organization Created Successfully! Redirecting...</span>
            </div>
          )}

          <div className="space-y-4">
            {/* 1. Organization Name */}
            <NameField
              value={formData.name}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, name: value }))
              }
              label="Organization Name"
              placeholder="Enter your Organization name"
              required
              forceError={submitAttempted}
            />

            {/* 2. Billing Email */}
            <EmailField
              value={formData.billingEmail}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, billingEmail: value }))
              }
              label="Billing Email"
              placeholder="Enter your billing email"
              required
              forceError={submitAttempted}
            />

            {/* 3-5. Optional Tax & Billing Section */}
            <details className="group border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg)]/50">
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span>Tax & billing address</span>
                    <span className="text-xs font-normal text-[var(--text-secondary)]">(optional)</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    GST, address, invoice preference
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 group-open:rotate-180" />
              </summary>

              <div className="p-4 pt-1 border-t border-[var(--border)] space-y-4">
                {/* GST Number */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    GST Number
                  </label>
                  <div className="relative flex items-center">
                    <Receipt className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="gstNumber"
                      value={billingMeta.gstNumber}
                      onChange={handleBillingMetaChange}
                      placeholder="Enter GST Number"
                      className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Billing Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-3.5 pointer-events-none" />
                    <textarea
                      name="billingAddress"
                      value={billingMeta.billingAddress}
                      onChange={handleBillingMetaChange}
                      placeholder="Enter billing address"
                      rows={2}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Invoice Preference */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Invoice Preference
                  </label>
                  <select
                    name="invoicePreference"
                    value={billingMeta.invoicePreference}
                    onChange={handleBillingMetaChange}
                    className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                  >
                    <option value="" disabled>Select Invoice Preference</option>
                    {INVOICE_PREFERENCES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </details>
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--border)] flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-[var(--border)] font-semibold text-xs text-[var(--text-primary)] hover:bg-[var(--border)]/40 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !isFormValid}
              className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Organization...</span>
                </>
              ) : (
                <span>Create Organization</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
