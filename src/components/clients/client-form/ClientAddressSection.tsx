"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import DrawerSection from "@/components/common/DrawerSection";
import Dropdown from "@/components/common/Dropdown";
import { InputField } from "@/components/ui/InputField";
import { ClientFormValues } from "@/utils/schema";

const ADDRESS_TYPES = [
  { value: "REGISTERED", label: "Registered" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "BRANCH", label: "Branch" },
] as const;

export default function ClientAddressSection() {
  const { watch, setValue } = useFormContext<ClientFormValues>();
  const watchedAddressType = watch("addressType") || "REGISTERED";

  return (
    <DrawerSection
      step={4}
      title="Addresses"
      subtitle="Registered / Communication"
      collapsible
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[13px] font-bold text-[var(--text-primary)]">
            Address Type
          </label>
          <Dropdown
            value={watchedAddressType}
            onChange={(val) =>
              setValue("addressType", val as "REGISTERED" | "COMMUNICATION" | "BRANCH", {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            options={ADDRESS_TYPES}
            fullWidth
          />
        </div>

        <InputField
          name="line1"
          label="Address Line"
          placeholder="Door No, Street Name"
        />

        <InputField
          name="city"
          label="City"
          placeholder="e.g. Hyderabad"
        />

        <InputField
          name="state"
          label="State"
          placeholder="e.g. Telangana"
        />

        <InputField
          name="pincode"
          label="Pincode"
          placeholder="e.g. 500001"
          maxLength={6}
        />
      </div>
    </DrawerSection>
  );
}
