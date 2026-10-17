"use client";

import React, { useEffect, useState } from "react";
import { UserRoundPlus, Pencil, X, Loader2 } from "lucide-react";
import Drawer from "@/components/common/Drawer";
import { FormWrapper } from "@/components/wrappers/FormWrapper";
import { useAsyncAction } from "@/hooks/useAnyAction";
import { useClientFormData } from "@/hooks/clients/useClientFormData";
import {
  createSubject,
  updateSubject,
  getSubjectById,
} from "@/services/subjectService";
import { StaffMember } from "@/types/staff.types";
import { Subject, CreateSubjectDto, UpdateSubjectDto } from "@/types/subject";
import { clientFormSchema, ClientFormValues } from "@/utils/schema";

import ClientInfoSection from "./client-form/ClientInfoSection";
import ClientIdentifiersSection from "./client-form/ClientIdentifiersSection";
import ClientComplianceSection from "./client-form/ClientComplianceSection";
import ClientAddressSection from "./client-form/ClientAddressSection";
import ClientNotificationsSection from "./client-form/ClientNotificationsSection";
import ClientTeamSection from "./client-form/ClientTeamSection";
import ClientNotesSection from "./client-form/ClientNotesSection";

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSuccess?: (savedSubject?: Subject) => void;
  clientId?: string | null;
}

const CLIENT_FORM_ID = "client-form";

const DEFAULT_FORM_VALUES: ClientFormValues = {
  fullName: "",
  phone: "",
  email: "",
  companyName: "",
  pan: "",
  gstin: "",
  tan: "",
  complianceGstEnabled: false,
  complianceGstFrequency: "QUARTERLY",
  complianceTdsEnabled: false,
  complianceTdsFrequency: "QUARTERLY",
  complianceItrEnabled: false,
  complianceItrFrequency: "ANNUAL",
  complianceRocEnabled: false,
  complianceRocFrequency: "ANNUAL",
  complianceMsmeEnabled: false,
  complianceMsmeFrequency: "ANNUAL",
  addressType: "REGISTERED",
  line1: "",
  city: "",
  state: "",
  pincode: "",
  notifChannels: ["WHATSAPP", "EMAIL"],
  assignedStaffId: "",
  notes: "",
};

function ClientFormContent({
  staff,
  staffLoading,
  onAddStaffSuccess,
  businessId,
}: {
  staff: StaffMember[];
  staffLoading: boolean;
  onAddStaffSuccess: (newStaff?: StaffMember) => void;
  businessId: string;
}) {
  return (
    <div className="space-y-4">
      <ClientInfoSection />
      <ClientIdentifiersSection />
      <ClientComplianceSection />
      <ClientAddressSection />
      <ClientNotificationsSection />
      <ClientTeamSection
        staff={staff}
        staffLoading={staffLoading}
        onAddStaffSuccess={onAddStaffSuccess}
        businessId={businessId}
      />
      <ClientNotesSection />
    </div>
  );
}

export default function CreateClientDialog({
  open,
  onClose,
  businessId,
  onSuccess,
  clientId,
}: CreateClientDialogProps) {
  const mode: "create" | "edit" = clientId ? "edit" : "create";

  const [initialFormValues, setInitialFormValues] = useState<
    ClientFormValues | undefined
  >(undefined);
  const [headerTitle, setHeaderTitle] = useState("");

  const saveAction = useAsyncAction();
  const fetchClientAction = useAsyncAction();

  const {
    staff,
    staffLoading,
    error: fetchError,
    setError: setFetchError,
    refetchStaff,
  } = useClientFormData(businessId, open);

  // ── Edit Mode: fetch client details ───────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      setInitialFormValues(undefined);
      setHeaderTitle("");
      return;
    }
    if (!clientId) return;

    fetchClientAction.run(
      async () => {
        const client = await getSubjectById(businessId, clientId);
        setHeaderTitle(client.profile?.displayName || client.profile?.businessName || "");

        const compliance = client.metadata?.complianceProfile;
        const firstAddress = client.addresses?.[0];
        const primaryGstin = client.gst?.gstins?.[0]?.gstin || "";

        setInitialFormValues({
          fullName: client.profile?.displayName || client.primaryContact?.name || "",
          phone: client.primaryContact?.phone || "",
          email: client.primaryContact?.email || "",
          companyName: client.profile?.businessName || client.profile?.legalName || "",
          pan: client.identifiers?.pan || "",
          gstin: primaryGstin,
          tan: client.identifiers?.tan || "",
          complianceGstEnabled: Boolean(compliance?.gst?.enabled),
          complianceGstFrequency: compliance?.gst?.frequency || "QUARTERLY",
          complianceTdsEnabled: Boolean(compliance?.tds?.enabled),
          complianceTdsFrequency: compliance?.tds?.frequency || "QUARTERLY",
          complianceItrEnabled: Boolean(compliance?.itr?.enabled),
          complianceItrFrequency: compliance?.itr?.frequency || "ANNUAL",
          complianceRocEnabled: Boolean(compliance?.roc?.enabled),
          complianceRocFrequency: compliance?.roc?.frequency || "ANNUAL",
          complianceMsmeEnabled: Boolean(compliance?.msme?.enabled),
          complianceMsmeFrequency: compliance?.msme?.frequency || "ANNUAL",
          addressType: (firstAddress?.type as any) || "REGISTERED",
          line1: firstAddress?.line1 || "",
          city: firstAddress?.city || "",
          state: firstAddress?.state || "",
          pincode: firstAddress?.pincode || "",
          notifChannels: client.notificationPreferences?.defaultChannels || [
            "WHATSAPP",
            "EMAIL",
          ],
          assignedStaffId: client.assignedTeam?.primaryAssignee?.userId || "",
          notes: client.notes?.[0]?.text || "",
        });
      },
      {
        errorMessage: "Failed to load client details",
        showErrorToast: false,
      }
    );
  }, [open, mode, clientId, businessId]);

  const handleClose = () => {
    if (saveAction.loading) return;
    fetchClientAction.reset();
    saveAction.reset();
    setFetchError("");
    onClose();
  };

  const handleStaffCreated = async (newStaff?: StaffMember) => {
    await refetchStaff();
  };

  const handleSubmit = async (data: ClientFormValues) => {
    const primaryName = data.fullName.trim();
    const businessName = (data.companyName || data.fullName).trim();

    const selectedStaff = staff.find((s) => s.id === data.assignedStaffId);
    const staffDisplayName = selectedStaff
      ? `${selectedStaff.firstName ?? ""} ${selectedStaff.lastName ?? ""}`.trim() ||
        selectedStaff.userName ||
        ""
      : "";

    const validAddresses = data.line1?.trim()
      ? [
          {
            type: data.addressType,
            line1: data.line1.trim(),
            city: data.city?.trim() || "",
            state: data.state?.trim() || "",
            pincode: data.pincode?.trim() || "",
          },
        ]
      : [];

    const validGstins = data.gstin?.trim()
      ? [
          {
            gstin: data.gstin.trim().toUpperCase(),
            state: data.state?.trim() || "",
            registrationType: "REGULAR" as const,
            status: "ACTIVE" as const,
          },
        ]
      : [];

    const dto: CreateSubjectDto & UpdateSubjectDto = {
      subjectType: "CLIENT",
      profile: {
        displayName: primaryName,
        businessName,
        legalName: businessName,
        constitution: "INDIVIDUAL",
        industry: "General",
        businessNature: ["General"],
      },
      primaryContact: {
        name: primaryName,
        phone: data.phone.trim(),
        email: data.email.trim(),
      },
      contacts: [],
      isActive: true,
      identifiers: {
        pan: data.pan?.trim().toUpperCase() || undefined,
        tan: data.tan?.trim().toUpperCase() || undefined,
      },
      gst: validGstins.length > 0 ? { gstins: validGstins } : undefined,
      addresses: validAddresses.length > 0 ? validAddresses : undefined,
      metadata: {
        complianceProfile: {
          gst: {
            enabled: data.complianceGstEnabled,
            frequency: data.complianceGstFrequency,
          },
          tds: {
            enabled: data.complianceTdsEnabled,
            frequency: data.complianceTdsFrequency,
          },
          itr: {
            enabled: data.complianceItrEnabled,
            frequency: data.complianceItrFrequency,
          },
          roc: {
            enabled: data.complianceRocEnabled,
            frequency: data.complianceRocFrequency,
          },
          msme: {
            enabled: data.complianceMsmeEnabled,
            frequency: data.complianceMsmeFrequency,
          },
        },
        dueDateOverrides: [],
        tags: [],
      },
      notificationPreferences: {
        defaultChannels: data.notifChannels,
        language: "en",
        timezone: "Asia/Kolkata",
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "08:00",
        },
      },
      assignedTeam: selectedStaff
        ? {
            primaryAssignee: {
              userId: selectedStaff.id,
              name: staffDisplayName,
            },
          }
        : undefined,
      notes: data.notes?.trim() ? [{ text: data.notes.trim() }] : [],
    };

    await saveAction.run(
      async () => {
        if (mode === "edit" && clientId) {
          return await updateSubject(businessId, clientId, dto);
        } else {
          return await createSubject(businessId, dto);
        }
      },
      {
        successMessage:
          mode === "edit"
            ? "Client updated successfully"
            : "Client created successfully",
        errorMessage:
          mode === "edit" ? "Failed to update client" : "Failed to create client",
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: (saved) => {
          onSuccess?.(saved);
          handleClose();
        },
      }
    );
  };

  const currentDefaultValues =
    mode === "edit" && initialFormValues
      ? initialFormValues
      : DEFAULT_FORM_VALUES;

  const formKey =
    mode === "edit"
      ? `edit-${clientId}-${initialFormValues ? "loaded" : "pending"}`
      : "create";

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={mode === "edit" ? headerTitle || "Edit Client" : "Create Client"}
      width="lg"
      customHeader={
        <div className="bg-[#0F1E36] px-6 py-5 flex items-center justify-between text-white shrink-0 border-b border-white/10 select-none">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-slate-950 font-bold shadow-sm shrink-0">
              {mode === "edit" ? (
                <Pencil className="h-5 w-5 text-slate-950 stroke-[2.5]" />
              ) : (
                <UserRoundPlus className="h-5 w-5 text-slate-950 stroke-[2.5]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-0.5">
                {mode === "edit" ? "Update client" : "New client"}
              </p>
              <h2 className="text-lg font-extrabold leading-tight text-white tracking-tight truncate">
                {mode === "edit"
                  ? headerTitle || "Update Client Details"
                  : "Create New Client"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saveAction.loading}
            aria-label="Close"
            className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      }
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={saveAction.loading}
            className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-semibold text-txt-main bg-[var(--bg)] transition-all hover:bg-[var(--border)]/60 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={CLIENT_FORM_ID}
            disabled={saveAction.loading || fetchClientAction.loading}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 shadow-md transition-all hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {saveAction.loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{mode === "edit" ? "Saving..." : "Creating..."}</span>
              </>
            ) : (
              <span>{mode === "edit" ? "Save changes" : "Create client"}</span>
            )}
          </button>
        </div>
      }
    >
      <div className="py-1">
        {/* Loading Indicator for edit mode */}
        {fetchClientAction.loading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs mb-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Loading client details...</span>
          </div>
        )}

        {/* Global error alert */}
        {fetchError && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs mb-4">
            <span>{fetchError}</span>
            <button
              type="button"
              onClick={() => setFetchError("")}
              className="p-1 hover:bg-red-100 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <FormWrapper
          key={formKey}
          formId={CLIENT_FORM_ID}
          schema={clientFormSchema}
          defaultValues={currentDefaultValues}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <ClientFormContent
            staff={staff}
            staffLoading={staffLoading}
            onAddStaffSuccess={handleStaffCreated}
            businessId={businessId}
          />
        </FormWrapper>
      </div>
    </Drawer>
  );
}