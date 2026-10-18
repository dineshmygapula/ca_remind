"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText, Landmark, FileCheck, Briefcase, Factory } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import Dropdown from "@/components/common/Dropdown";
import { ClientFormValues } from "@/utils/schema";

const FREQUENCY_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
] as const;

interface ComplianceItemConfig {
  key: "complianceGst" | "complianceTds" | "complianceItr" | "complianceRoc" | "complianceMsme";
  enabledKey: "complianceGstEnabled" | "complianceTdsEnabled" | "complianceItrEnabled" | "complianceRocEnabled" | "complianceMsmeEnabled";
  frequencyKey: "complianceGstFrequency" | "complianceTdsFrequency" | "complianceItrFrequency" | "complianceRocFrequency" | "complianceMsmeFrequency";
  label: string;
  code: string;
  icon: React.ReactNode;
  color: string;
}

const COMPLIANCE_ITEMS: ComplianceItemConfig[] = [
  {
    key: "complianceGst",
    enabledKey: "complianceGstEnabled",
    frequencyKey: "complianceGstFrequency",
    label: "GST",
    code: "GST",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40",
  },
  {
    key: "complianceTds",
    enabledKey: "complianceTdsEnabled",
    frequencyKey: "complianceTdsFrequency",
    label: "TDS",
    code: "TDS",
    icon: <Landmark className="h-4 w-4" />,
    color: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40",
  },
  {
    key: "complianceItr",
    enabledKey: "complianceItrEnabled",
    frequencyKey: "complianceItrFrequency",
    label: "ITR",
    code: "ITR",
    icon: <FileCheck className="h-4 w-4" />,
    color: "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/40",
  },
  {
    key: "complianceRoc",
    enabledKey: "complianceRocEnabled",
    frequencyKey: "complianceRocFrequency",
    label: "ROC",
    code: "ROC",
    icon: <Briefcase className="h-4 w-4" />,
    color: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40",
  },
  {
    key: "complianceMsme",
    enabledKey: "complianceMsmeEnabled",
    frequencyKey: "complianceMsmeFrequency",
    label: "MSME",
    code: "MSME",
    icon: <Factory className="h-4 w-4" />,
    color: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40",
  },
];

export default function ClientComplianceSection() {
  const { watch, setValue } = useFormContext<ClientFormValues>();

  return (
    <DrawerSection
      step={3}
      title="Compliance Services"
      subtitle="Active schedules"
      collapsible
      defaultExpanded={true}
    >
      <div className="space-y-3">
        {COMPLIANCE_ITEMS.map(({ enabledKey, frequencyKey, label, code, icon, color }) => {
          const isEnabled = watch(enabledKey);
          const currentFreq = watch(frequencyKey);

          return (
            <div
              key={enabledKey}
              className="p-4 rounded-xl border border-divider bg-bg/40 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${color}`}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-txt-main">{label}</p>
                    <p className="text-xs text-txt-sub">
                      {isEnabled
                        ? `${code} · ${currentFreq || "Select frequency"}`
                        : `${code} · Inactive`}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span
                    className={`text-xs font-semibold ${
                      isEnabled
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-txt-sub"
                    }`}
                  >
                    {isEnabled ? "Active" : "Inactive"}
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-sm"
                    checked={Boolean(isEnabled)}
                    onChange={(e) => {
                      setValue(enabledKey, e.target.checked, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />
                </label>
              </div>

              {isEnabled && (
                <div className="mt-3 pt-3 border-t border-divider/60">
                  <label className="text-xs font-bold text-txt-main mb-1.5 block">
                    Select Filing Frequency
                  </label>
                  <Dropdown
                    value={currentFreq || "QUARTERLY"}
                    onChange={(val) => {
                      setValue(frequencyKey, val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    options={FREQUENCY_OPTIONS}
                    placeholder="Select frequency"
                    fullWidth
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DrawerSection>
  );
}
