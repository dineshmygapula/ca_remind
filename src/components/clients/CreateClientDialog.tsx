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
import {
  Subject,
  CreateSubjectDto,
  UpdateSubjectDto,
  ComplianceService,
} from "@/types/subject";
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
  const [existingClient, setExistingClient] = useState<Subject | null>(null);
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
      setExistingClient(null);
      setHeaderTitle("");
      return;
    }
    if (!clientId) return;

    fetchClientAction.run(
      async () => {
        const client = await getSubjectById(businessId, clientId);
        setExistingClient(client);
        setHeaderTitle(
          client.profile?.displayName || client.profile?.businessName || "",
        );

        const compliance = client.metadata?.complianceProfile;
        const firstAddress = client.addresses?.[0];
        const primaryGstin = client.gst?.gstins?.[0]?.gstin || "";

        setInitialFormValues({
          fullName:
            client.profile?.displayName || client.primaryContact?.name || "",
          phone: client.primaryContact?.phone || "",
          email: client.primaryContact?.email || "",
          companyName:
            client.profile?.businessName || client.profile?.legalName || "",
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
      },
    );
  }, [open, mode, clientId, businessId]);

  const handleClose = () => {
    if (saveAction.loading) return;
    fetchClientAction.reset();
    saveAction.reset();
    setFetchError("");
    setExistingClient(null);
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

    if (mode === "edit" && clientId) {
      const existingAddress = existingClient?.addresses?.[0];
      const validAddresses = data.line1?.trim()
        ? [
            {
              addressId: existingAddress?.addressId || "addr-1",
              type:
                (data.addressType as
                  | "REGISTERED"
                  | "COMMUNICATION"
                  | "BRANCH") ||
                existingAddress?.type ||
                "REGISTERED",
              line1: data.line1.trim(),
              city: data.city?.trim() || "",
              state: data.state?.trim() || "",
              pincode: data.pincode?.trim() || "",
            },
          ]
        : existingClient?.addresses && existingClient.addresses.length > 0
          ? existingClient.addresses.map((a, idx) => ({
              addressId: a.addressId || `addr-${idx + 1}`,
              type:
                (a.type as "REGISTERED" | "COMMUNICATION" | "BRANCH") ||
                "REGISTERED",
              line1: a.line1 || "",
              city: a.city || "",
              state: a.state || "",
              pincode: a.pincode || "",
            }))
          : [];

      const existingGstEntry = existingClient?.gst?.gstins?.[0];
      const validGstins = data.gstin?.trim()
        ? [
            {
              gstin: data.gstin.trim().toUpperCase(),
              state: data.state?.trim() || existingGstEntry?.state || "Delhi",
              registrationType:
                (existingGstEntry?.registrationType as
                  | "REGULAR"
                  | "COMPOSITION"
                  | "EXEMPTED") || "REGULAR",
              status:
                (existingGstEntry?.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
            },
          ]
        : existingClient?.gst?.gstins && existingClient.gst.gstins.length > 0
          ? existingClient.gst.gstins.map((g) => ({
              gstin: g.gstin,
              state: g.state || "Delhi",
              registrationType:
                (g.registrationType as
                  | "REGULAR"
                  | "COMPOSITION"
                  | "EXEMPTED") || "REGULAR",
              status: (g.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
            }))
          : [];

      const existingContacts = existingClient?.contacts || [];
      const updatedContacts =
        existingContacts.length > 0
          ? existingContacts.map((c, idx) => ({
              contactId: c.contactId || `contact-${idx + 1}`,
              name: idx === 0 || c.isPrimary ? primaryName : c.name,
              role: (c.role || "OWNER") as "OWNER" | "ACCOUNTANT" | "MANAGER",
              phone: idx === 0 || c.isPrimary ? data.phone.trim() : c.phone,
              email: idx === 0 || c.isPrimary ? data.email.trim() : c.email,
              isPrimary: idx === 0 || Boolean(c.isPrimary),
            }))
          : [
              {
                contactId: "contact-1",
                name: primaryName,
                role: "OWNER" as const,
                phone: data.phone.trim(),
                email: data.email.trim(),
                isPrimary: true,
              },
            ];

      const existingNotes = existingClient?.notes || [];
      const updatedNotes = data.notes?.trim()
        ? existingNotes.length > 0
          ? existingNotes.map((n, idx) =>
              idx === 0
                ? {
                    noteId: n.noteId || "note-1",
                    text: data.notes.trim(),
                    createdBy: {
                      userId:
                        n.createdBy?.userId || selectedStaff?.id || "",
                      name:
                        n.createdBy?.name || staffDisplayName || "",
                    },
                    createdAt: n.createdAt || new Date().toISOString(),
                  }
                : {
                    noteId: n.noteId || `note-${idx + 1}`,
                    text: n.text,
                    createdBy: {
                      userId: n.createdBy?.userId || "",
                      name: n.createdBy?.name || "",
                    },
                    createdAt: n.createdAt || new Date().toISOString(),
                  },
            )
          : [
              {
                noteId: "note-1",
                text: data.notes.trim(),
                createdBy: {
                  userId: selectedStaff?.id || "",
                  name: staffDisplayName || "",
                },
                createdAt: new Date().toISOString(),
              },
            ]
        : existingNotes.map((n, idx) => ({
            noteId: n.noteId || `note-${idx + 1}`,
            text: n.text,
            createdBy: {
              userId: n.createdBy?.userId || "",
              name: n.createdBy?.name || "",
            },
            createdAt: n.createdAt || new Date().toISOString(),
          }));

      const buildComplianceService = (
        enabled: boolean,
        frequency: string,
        existing?: ComplianceService
      ) => {
        const svc: Record<string, unknown> = {
          enabled: Boolean(enabled),
          frequency: frequency || existing?.frequency || "QUARTERLY",
        };

        if (
          existing?.internalTargetOffsetDays !== undefined &&
          existing.internalTargetOffsetDays > 0
        ) {
          svc.internalTargetOffsetDays = existing.internalTargetOffsetDays;
        }
        if (
          existing?.customDueDay !== undefined &&
          existing.customDueDay >= 1 &&
          existing.customDueDay <= 31
        ) {
          svc.customDueDay = existing.customDueDay;
        }
        if (existing?.customDueMonth && existing.customDueMonth.trim()) {
          svc.customDueMonth = existing.customDueMonth.trim();
        }
        if (
          existing?.quarterlyDates &&
          Object.keys(existing.quarterlyDates).length > 0
        ) {
          svc.quarterlyDates = existing.quarterlyDates;
        }

        return svc as unknown as ComplianceService;
      };

      const updatePayload: UpdateSubjectDto = {
        profile: {
          displayName: primaryName,
          legalName: existingClient?.profile?.legalName || businessName,
          businessName: businessName,
          constitution: existingClient?.profile?.constitution || "INDIVIDUAL",
          industry: existingClient?.profile?.industry || "General",
          businessNature:
            existingClient?.profile?.businessNature &&
            existingClient.profile.businessNature.length > 0
              ? existingClient.profile.businessNature
              : ["General"],
        },
        identifiers: {
          pan:
            data.pan?.trim().toUpperCase() ||
            existingClient?.identifiers?.pan ||
            "",
          tan:
            data.tan?.trim().toUpperCase() ||
            existingClient?.identifiers?.tan ||
            "",
          cin: existingClient?.identifiers?.cin || "",
          udyam: existingClient?.identifiers?.udyam || "",
          iec: existingClient?.identifiers?.iec ?? null,
        },
        gst: {
          gstins: validGstins,
        },
        primaryContact: {
          name: primaryName,
          phone: data.phone.trim(),
          email: data.email.trim(),
        },
        contacts: updatedContacts,
        addresses: validAddresses,
        notificationPreferences: {
          defaultChannels: data.notifChannels,
          language: existingClient?.notificationPreferences?.language || "en",
          timezone:
            existingClient?.notificationPreferences?.timezone || "Asia/Kolkata",
          quietHours: {
            enabled:
              existingClient?.notificationPreferences?.quietHours?.enabled ??
              false,
            start:
              existingClient?.notificationPreferences?.quietHours?.start ||
              "22:00",
            end:
              existingClient?.notificationPreferences?.quietHours?.end ||
              "08:00",
          },
        },
        assignedTeam: {
          primaryAssignee: selectedStaff
            ? {
                userId: selectedStaff.id,
                name: staffDisplayName,
              }
            : existingClient?.assignedTeam?.primaryAssignee?.userId
              ? {
                  userId: existingClient.assignedTeam.primaryAssignee.userId,
                  name: existingClient.assignedTeam.primaryAssignee.name || "",
                }
              : {
                  userId: "",
                  name: "",
                },
        },
        notes: updatedNotes,
        metadata: {
          complianceProfile: {
            gst: buildComplianceService(
              data.complianceGstEnabled,
              data.complianceGstFrequency,
              existingClient?.metadata?.complianceProfile?.gst
            ),
            tds: buildComplianceService(
              data.complianceTdsEnabled,
              data.complianceTdsFrequency,
              existingClient?.metadata?.complianceProfile?.tds
            ),
            itr: buildComplianceService(
              data.complianceItrEnabled,
              data.complianceItrFrequency,
              existingClient?.metadata?.complianceProfile?.itr
            ),
            roc: buildComplianceService(
              data.complianceRocEnabled,
              data.complianceRocFrequency,
              existingClient?.metadata?.complianceProfile?.roc
            ),
          },
          dueDateOverrides: Array.isArray(
            existingClient?.metadata?.dueDateOverrides
          )
            ? existingClient.metadata.dueDateOverrides.filter(
                (x) => x !== null && typeof x === "object"
              )
            : [],
          tags: existingClient?.metadata?.tags || [],
        },
        isActive: existingClient?.isActive ?? true,
      };

      await saveAction.run(
        async () => {
          return await updateSubject(businessId, clientId, updatePayload);
        },
        {
          successMessage: "Client updated successfully",
          errorMessage: "Failed to update client",
          showSuccessToast: true,
          showErrorToast: true,
          onSuccess: (saved) => {
            onSuccess?.(saved);
            handleClose();
          },
        },
      );
      return;
    }

    // ── Create Mode ─────────────────────────────────────────────────────────
    const validAddresses = data.line1?.trim()
      ? [
          {
            addressId: "addr-1",
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
            state: data.state?.trim() || "Delhi",
            registrationType: "REGULAR" as const,
            status: "ACTIVE" as const,
          },
        ]
      : [];

    const createPayload: CreateSubjectDto = {
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
      contacts: [
        {
          contactId: "contact-1",
          name: primaryName,
          role: "OWNER",
          phone: data.phone.trim(),
          email: data.email.trim(),
          isPrimary: true,
        },
      ],
      isActive: true,
      identifiers: {
        pan: data.pan?.trim().toUpperCase() || "",
        tan: data.tan?.trim().toUpperCase() || "",
        cin: "",
        udyam: "",
        iec: null,
      },
      gst: { gstins: validGstins },
      addresses: validAddresses,
      metadata: {
        complianceProfile: {
          gst: {
            enabled: Boolean(data.complianceGstEnabled),
            frequency: data.complianceGstFrequency || "QUARTERLY",
          },
          tds: {
            enabled: Boolean(data.complianceTdsEnabled),
            frequency: data.complianceTdsFrequency || "QUARTERLY",
          },
          itr: {
            enabled: Boolean(data.complianceItrEnabled),
            frequency: data.complianceItrFrequency || "ANNUAL",
          },
          roc: {
            enabled: Boolean(data.complianceRocEnabled),
            frequency: data.complianceRocFrequency || "ANNUAL",
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
      assignedTeam: {
        primaryAssignee: selectedStaff
          ? {
              userId: selectedStaff.id,
              name: staffDisplayName,
            }
          : {
              userId: "",
              name: "",
            },
      },
      notes: data.notes?.trim()
        ? [
            {
              noteId: "note-1",
              text: data.notes.trim(),
              createdBy: {
                userId: selectedStaff?.id || "",
                name: staffDisplayName || "",
              },
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    };

    await saveAction.run(
      async () => {
        return await createSubject(businessId, createPayload);
      },
      {
        successMessage: "Client created successfully",
        errorMessage: "Failed to create client",
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: (saved) => {
          onSuccess?.(saved);
          handleClose();
        },
      },
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

        {mode === "edit" && fetchClientAction.loading && !initialFormValues ? (
          <div className="flex flex-col items-center justify-center py-20 text-txt-sub">
            <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B] mb-2" />
            <span className="text-sm font-medium">
              Loading client details...
            </span>
          </div>
        ) : (
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
        )}
      </div>
    </Drawer>
  );
}
