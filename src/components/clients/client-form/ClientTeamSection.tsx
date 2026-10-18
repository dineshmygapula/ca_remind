"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Plus } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import Dropdown from "@/components/common/Dropdown";
import AddStaffDialog from "@/components/staff/AddStaffDialog";
import { StaffMember } from "@/types/staff.types";
import { ClientFormValues } from "@/utils/schema";

interface ClientTeamSectionProps {
  staff: StaffMember[];
  staffLoading: boolean;
  onAddStaffSuccess: (newStaff?: StaffMember) => void;
  businessId: string;
}

export default function ClientTeamSection({
  staff,
  staffLoading,
  onAddStaffSuccess,
  businessId,
}: ClientTeamSectionProps) {
  const { watch, setValue } = useFormContext<ClientFormValues>();
  const [openAddStaff, setOpenAddStaff] = useState(false);

  const watchedStaffId = watch("assignedStaffId") || "";

  const staffOptions = [
    { value: "", label: "No staff assigned" },
    ...staff.map((s) => ({
      value: s.id,
      label:
        s.firstName && s.lastName
          ? `${s.firstName} ${s.lastName}`
          : s.userName || "Staff Member",
    })),
  ];

  return (
    <>
      <DrawerSection
        step={6}
        title="Assign Team"
        subtitle="Primary staff member"
        collapsible
        defaultExpanded={false}
      >
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[13px] font-bold text-[var(--text-primary)]">
            Staff Member
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Dropdown
                value={watchedStaffId}
                onChange={(val) => {
                  setValue("assignedStaffId", val, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                options={staffOptions}
                placeholder={staffLoading ? "Loading staff..." : "Select staff"}
                disabled={staffLoading}
                fullWidth
              />
            </div>

            <button
              type="button"
              onClick={() => setOpenAddStaff(true)}
              className="h-10 px-3.5 rounded-xl border border-divider bg-bg/50 hover:bg-surface text-txt-main text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs hover:border-blue-500/40"
              title="Add new staff member"
            >
              <Plus className="h-4 w-4 text-blue-500" />
              <span className="hidden sm:inline">Add Staff</span>
            </button>
          </div>
        </div>
      </DrawerSection>

      <AddStaffDialog
        open={openAddStaff}
        onClose={() => setOpenAddStaff(false)}
        businessId={businessId}
        onSuccess={async (newStaff?: StaffMember) => {
          setOpenAddStaff(false);
          onAddStaffSuccess(newStaff);
        }}
      />
    </>
  );
}
