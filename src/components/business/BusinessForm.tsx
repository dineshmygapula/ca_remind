"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { BusinessFormData } from "../../types/business";
import { BUSINESS_TYPE_OPTIONS } from "../../constants/businessConstants";
import { BUSINESS_TIME_ZONE_OPTIONS } from "../../constants/businessConstants";
import { INDIAN_STATES } from "../../constants/clientConstants";

interface BusinessFormProps {
  formData: BusinessFormData;
  submitting: boolean;
  onSubmit: () => void;
  onFieldChange: (field: keyof BusinessFormData, value: string) => void;
  onAddressChange: (field: string, value: string) => void;
}

export default function BusinessForm({
  formData,
  submitting,
  onSubmit,
  onFieldChange,
  onAddressChange,
}: BusinessFormProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const nameRegex = /^[A-Za-z0-9\s&.,'()-]+$/;
  const isNameValid =
    formData.name.trim().length > 0 && nameRegex.test(formData.name.trim());

  const phoneDigits = formData.phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;

  const isFormValid = isNameValid && isPhoneValid;

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isFormValid) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmitClick} className="flex flex-col">
      {/* Step label */}
      <div className="pb-3 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] border-b border-[var(--border)] mb-4">
        <span>Step 3 of 3 · Business</span>
        <span className="font-bold text-[var(--primary)]">100%</span>
      </div>

      <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
        Start with a name and phone. You can add owner, email, and a full
        address (city, state, country, etc.) now or later in business profile.
      </p>

      {/* 1. Business Name */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-1.5 text-[var(--text-secondary)]">
          Business name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          placeholder="Shown in the app"
          className={`w-full h-11 px-3.5 text-sm rounded-xl border bg-[var(--surface)] text-[var(--text-primary)] transition-colors outline-none placeholder:text-[var(--text-secondary)]/60 ${
            submitAttempted && !isNameValid
              ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500"
              : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          }`}
        />
        {submitAttempted && !isNameValid && (
          <p className="text-xs text-rose-500 font-medium mt-1 ml-1">
            {formData.name.trim().length === 0
              ? "Business name is required"
              : "Only letters, numbers & . , & ' ( ) - allowed"}
          </p>
        )}
      </div>

      {/* 2. Phone Number */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">
            Phone number <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-[var(--text-secondary)] font-mono">
            {phoneDigits.length}/10
          </span>
        </div>
        <input
          type="tel"
          maxLength={10}
          value={formData.phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
            onFieldChange("phone", val);
          }}
          placeholder="10-digit mobile"
          className={`w-full h-11 px-3.5 text-sm rounded-xl border bg-[var(--surface)] text-[var(--text-primary)] transition-colors outline-none font-mono placeholder:text-[var(--text-secondary)]/60 ${
            submitAttempted && !isPhoneValid
              ? "border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500"
              : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          }`}
        />
        {submitAttempted && !isPhoneValid && (
          <p className="text-xs text-rose-500 font-medium mt-1 ml-1">
            Enter a valid 10-digit mobile number
          </p>
        )}
      </div>

      {/* 3. Business Type */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-1.5 text-[var(--text-secondary)]">
          Business Type
        </label>
        <select
          value={formData.businessType || "OTHER"}
          onChange={(e) => onFieldChange("businessType", e.target.value)}
          className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
        >
          {BUSINESS_TYPE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Business Time Zone */}
      <div className="mb-4">
        <label className="block text-xs font-semibold mb-1 text-[var(--text-secondary)]">
          Business Time Zone
        </label>
        <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">
          Reminders and due dates are scheduled in this timezone
        </p>
        <select
          value={formData.businessTimeZone || ""}
          onChange={(e) => onFieldChange("businessTimeZone", e.target.value)}
          className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
        >
          {BUSINESS_TIME_ZONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Optional Accordion — Owner, Email, Address */}
      <details className="group border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg)]/50 mb-6">
        <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Owner, email, full address — same fields as business profile
          </span>
          <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 group-open:rotate-180" />
        </summary>

        <div className="p-4 pt-1 border-t border-[var(--border)] space-y-4">
          {/* Owner Name */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Owner name
            </label>
            <input
              type="text"
              value={formData.ownerName || ""}
              onChange={(e) => onFieldChange("ownerName", e.target.value)}
              placeholder="Optional"
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => onFieldChange("email", e.target.value)}
              placeholder="Optional"
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          {/* Street / Line 1 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Street / line 1
              </label>
              <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                {(formData.address?.line1 || "").length}/120
              </span>
            </div>
            <textarea
              maxLength={120}
              rows={2}
              value={formData.address?.line1 || ""}
              onChange={(e) => onAddressChange("line1", e.target.value)}
              placeholder="Building, street"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-none"
            />
          </div>

          {/* Area / Locality */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Area / locality
            </label>
            <input
              type="text"
              value={formData.address?.area || ""}
              onChange={(e) => onAddressChange("area", e.target.value)}
              placeholder="Optional"
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              City
            </label>
            <input
              type="text"
              value={formData.address?.city || ""}
              onChange={(e) => onAddressChange("city", e.target.value)}
              placeholder="Optional"
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              State
            </label>
            <select
              value={formData.address?.state || ""}
              onChange={(e) => onAddressChange("state", e.target.value)}
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Pincode */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Pincode
              </label>
              <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                {(formData.address?.pincode || "").length}/6
              </span>
            </div>
            <input
              type="text"
              maxLength={6}
              value={formData.address?.pincode || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                onAddressChange("pincode", val);
              }}
              placeholder="Up to 6 characters"
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors font-mono"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Country
            </label>
            <input
              type="text"
              value={formData.address?.country || "IN"}
              onChange={(e) => onAddressChange("country", e.target.value)}
              className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
            />
          </div>
        </div>
      </details>

      {/* Continue button */}
      <button
        type="submit"
        disabled={submitting || !isFormValid}
        className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>Continue</span>
        )}
      </button>
    </form>
  );
}
