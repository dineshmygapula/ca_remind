"use client";

import React from "react";
import DrawerSection from "@/components/common/DrawerSection";
import { TextareaField } from "@/components/ui/TextareaField";

export default function ClientNotesSection() {
  return (
    <DrawerSection
      step={7}
      title="Internal Notes"
      subtitle="Team comments"
      collapsible
      defaultExpanded={false}
    >
      <TextareaField
        name="notes"
        placeholder="Add any internal team notes about this client..."
        rows={3}
      />
    </DrawerSection>
  );
}
