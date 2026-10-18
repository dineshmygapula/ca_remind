"use client";

import React from "react";
import { UserRound, Phone, Mail, Building2 } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import { InputField } from "@/components/ui/InputField";

export default function ClientInfoSection() {
  return (
    <DrawerSection step={1} title="Client Information" required>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          name="fullName"
          label="Full Name"
          required
          placeholder="e.g. Rama Rao"
          icon={UserRound}
        />

        <InputField
          name="phone"
          label="Phone"
          required
          placeholder="10-digit mobile number"
          inputMode="numeric"
          maxLength={10}
          icon={Phone}
        />

        <InputField
          name="email"
          type="email"
          label="Email"
          required
          placeholder="name@example.com"
          icon={Mail}
        />

        <InputField
          name="companyName"
          label="Business Name"
          required
          placeholder="e.g. Rama Traders"
          icon={Building2}
        />
      </div>
    </DrawerSection>
  );
}
