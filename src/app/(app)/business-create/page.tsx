"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import BusinessForm from "@/components/business/BusinessForm";
import { createBusiness } from "@/services/businessService";
import { getOrganizations } from "@/services/organizationService";
import { useWorkspace } from "@/context/WorkspaceContext";
import { EMPTY_BUSINESS_FORM } from "../../../constants/businessConstants";
import { BusinessFormData } from "../../../types/business";
import type { CreateBusinessDto } from "@/types/business";

export default function BusinessCreatePage() {
  const router = useRouter();
  const { refresh, orgId: workspaceOrgId } = useWorkspace();

  const [formData, setFormData] = useState<BusinessFormData>(EMPTY_BUSINESS_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [organizationId, setOrganizationId] = useState<string>(workspaceOrgId || "");
  const [loadingOrg, setLoadingOrg] = useState(!workspaceOrgId);

  useEffect(() => {
    if (workspaceOrgId) {
      setOrganizationId(workspaceOrgId);
      setLoadingOrg(false);
      return;
    }

    const fetchOrg = async () => {
      try {
        const orgs = await getOrganizations();
        if (orgs.length === 0) {
          setError("No organization found. Please create an organization first.");
          return;
        }
        setOrganizationId(orgs[0].id);
      } catch {
        setError("Failed to load organization. Please try again.");
      } finally {
        setLoadingOrg(false);
      }
    };

    fetchOrg();
  }, [workspaceOrgId]);

  const handleFieldChange = (field: keyof BusinessFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, type: "REGISTERED", [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!organizationId) {
      setError("Organization not loaded. Please refresh and try again.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");

      const payload: CreateBusinessDto = {
        name: formData.name.trim(),
        phone: formData.phone,
        businessType: formData.businessType,
        timezone: formData.businessTimeZone || "India(IST)",
        locale: formData.locale || "en-IN",
        uiConfig: {},
        ...(formData.address?.line1?.trim() && {
          address: {
            type: "REGISTERED",
            line1: formData.address.line1.trim(),
            ...(formData.address.area && { area: formData.address.area }),
            ...(formData.address.city && { city: formData.address.city }),
            ...(formData.address.state && { state: formData.address.state }),
            ...(formData.address.pincode && { pincode: formData.address.pincode }),
            country: formData.address.country || "IN",
          },
        }),
      };

      await createBusiness(organizationId, payload);
      await refresh();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOrg) {
    return (
      <div className="min-h-screen bg-[var(--bg)] py-10 px-4 sm:px-6 flex justify-center animate-fade-in">
        <div className="max-w-xl w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
          <div className="h-1 bg-[var(--primary)] w-full" />
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="skeleton h-7 w-48 rounded-lg" />
              <div className="skeleton h-4 w-72 rounded-md" />
            </div>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="skeleton h-4 w-28 rounded-md" />
                <div className="skeleton h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-28 rounded-md" />
                <div className="skeleton h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-36 rounded-md" />
                <div className="skeleton h-11 w-full rounded-xl" />
              </div>
              <div className="skeleton h-12 w-full rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!organizationId && error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--surface)] border border-rose-200 dark:border-rose-900 rounded-2xl p-6 shadow-lg text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[var(--heading)] mb-2">Organization Required</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-5">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/organization-create")}
            className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white font-bold text-xs shadow-md hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-10 px-4 sm:px-6 flex justify-center">
      <div className="max-w-xl w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
        <div className="h-1 bg-[var(--primary)] w-full" />
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <BusinessForm
            formData={formData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onFieldChange={handleFieldChange}
            onAddressChange={handleAddressChange}
          />
        </div>
      </div>
    </div>
  );
}
