"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Mail } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import WhatsAppIcon from "@/components/common/WhatsAppIcon";
import { ClientFormValues } from "@/utils/schema";

const CHANNELS = [
  {
    channel: "WHATSAPP",
    label: "WhatsApp",
    desc: "Automated due date alerts & reminders",
    icon: <WhatsAppIcon className="h-5 w-5 text-emerald-500 shrink-0" />,
  },
  {
    channel: "EMAIL",
    label: "Email",
    desc: "Filing summaries & official notifications",
    icon: <Mail className="h-5 w-5 text-blue-500 shrink-0" />,
  },
] as const;

export default function ClientNotificationsSection() {
  const { watch, setValue } = useFormContext<ClientFormValues>();
  const watchedChannels = watch("notifChannels") || [];

  const handleToggleChannel = (channel: string, checked: boolean) => {
    const next = checked
      ? [...watchedChannels, channel]
      : watchedChannels.filter((c) => c !== channel);
    setValue("notifChannels", next, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <DrawerSection
      step={5}
      title="Notification Preferences"
      subtitle="Channels"
      collapsible
      defaultExpanded={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHANNELS.map(({ channel, label, desc, icon }) => {
          const isChecked = watchedChannels.includes(channel);

          return (
            <label
              key={channel}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                isChecked
                  ? "border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-divider bg-bg/40 hover:bg-surface"
              }`}
            >
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm mt-0.5 rounded-md"
                checked={isChecked}
                onChange={(e) => handleToggleChannel(channel, e.target.checked)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-xs font-bold text-txt-main">{label}</span>
                </div>
                <p className="text-[11px] text-txt-sub mt-0.5">{desc}</p>
              </div>
            </label>
          );
        })}
      </div>
    </DrawerSection>
  );
}
