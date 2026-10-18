"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import { CHANNEL_OPTIONS } from "@/constants/messageTemplateConstants";
import { ChannelType } from "@/types/messageTemplate.types";
import { TemplateFormValues } from "@/utils/schema";

interface TemplateChannelsSectionProps {
  activeChannelTab: ChannelType;
  onActiveChannelTabChange: (channel: ChannelType) => void;
}

export default function TemplateChannelsSection({
  activeChannelTab,
  onActiveChannelTabChange,
}: TemplateChannelsSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TemplateFormValues>();

  const watchedChannels = (watch("channels") || []) as ChannelType[];

  const toggleChannel = (channel: ChannelType) => {
    const exists = watchedChannels.includes(channel);
    let newChannels: ChannelType[];

    if (exists) {
      if (watchedChannels.length === 1) {
        return; // At least one channel must remain
      }
      newChannels = watchedChannels.filter((c) => c !== channel);
      if (activeChannelTab === channel) {
        onActiveChannelTabChange(newChannels[0] || "email");
      }
    } else {
      newChannels = [...watchedChannels, channel];
      onActiveChannelTabChange(channel);
    }

    setValue("channels", newChannels as any, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <DrawerSection step={2} title="Delivery Channels" required>
      <p className="text-xs text-txt-sub">
        Select which communication channels this message template supports:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CHANNEL_OPTIONS.map((ch) => {
          const isSelected = watchedChannels.includes(ch.value as ChannelType);
          return (
            <button
              key={ch.value}
              type="button"
              onClick={() => toggleChannel(ch.value as ChannelType)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-[#F59E0B] bg-amber-50/50 dark:bg-amber-950/20 text-txt-main shadow-xs font-semibold ring-1 ring-[#F59E0B]"
                  : "border-[var(--border)] bg-[var(--surface)] text-txt-sub hover:bg-[var(--border)]/40 hover:text-txt-main"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{ch.icon}</span>
                <span className="text-xs font-bold">{ch.label}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
            </button>
          );
        })}
      </div>

      {errors.channels && (
        <p className="text-xs font-medium leading-4 text-red-500">
          {errors.channels.message}
        </p>
      )}
    </DrawerSection>
  );
}
