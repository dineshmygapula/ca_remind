"use client";

import React from "react";
import DrawerSection from "@/components/common/DrawerSection";
import { InputField } from "@/components/ui/InputField";

export default function ClientIdentifiersSection() {
  return (
    <DrawerSection
      step={2}
      title="Identifiers"
      subtitle="PAN, GSTIN, TAN"
      collapsible
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          name="pan"
          label="PAN"
          placeholder="e.g. ABCDE1234F"
          maxLength={10}
        />

        <InputField
          name="gstin"
          label="GSTIN"
          placeholder="e.g. 22AAAAA0000A1Z5"
          maxLength={15}
        />

        <InputField
          name="tan"
          label="TAN"
          placeholder="e.g. ABCD12345E"
          maxLength={10}
        />
      </div>
    </DrawerSection>
  );
}
