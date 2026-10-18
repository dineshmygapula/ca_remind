"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Copy } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import { InputField } from "@/components/ui/InputField";
import { TextareaField } from "@/components/ui/TextareaField";
import {
  CHANNEL_OPTIONS,
  COMMON_PLACEHOLDERS,
} from "@/constants/messageTemplateConstants";
import { ChannelType } from "@/types/messageTemplate.types";
import { TemplateFormValues } from "@/utils/schema";

type ActiveInputKey =
  | "emailSubject"
  | "emailBody"
  | "whatsappBody"
  | "smsBody"
  | "inAppBody";

interface TemplateContentSectionProps {
  activeChannelTab: ChannelType;
  onActiveChannelTabChange: (channel: ChannelType) => void;
}

export default function TemplateContentSection({
  activeChannelTab,
  onActiveChannelTabChange,
}: TemplateContentSectionProps) {
  const { watch, setValue, getValues } = useFormContext<TemplateFormValues>();

  const watchedChannels = (watch("channels") || []) as ChannelType[];
  const watchedPlaceholders = watch("selectedPlaceholders") || [];
  const watchedSmsBody = watch("smsBody") || "";

  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(
    null
  );
  const activeInputRef = useRef<ActiveInputKey>("emailBody");

  // Keep active input aligned when switching tabs
  useEffect(() => {
    if (activeChannelTab === "email") {
      activeInputRef.current = "emailBody";
    } else if (activeChannelTab === "whatsapp") {
      activeInputRef.current = "whatsappBody";
    } else if (activeChannelTab === "sms") {
      activeInputRef.current = "smsBody";
    } else if (activeChannelTab === "in_app") {
      activeInputRef.current = "inAppBody";
    }
  }, [activeChannelTab]);

  const insertPlaceholder = (phValue: string) => {
    const token = `[${phValue}]`;
    const targetKey = activeInputRef.current;
    const currentVal = getValues(targetKey) || "";
    const nextVal = currentVal + (currentVal ? " " : "") + token;

    setValue(targetKey, nextVal, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (!watchedPlaceholders.includes(phValue)) {
      setValue("selectedPlaceholders", [...watchedPlaceholders, phValue], {
        shouldDirty: true,
      });
    }

    setCopiedPlaceholder(phValue);
    setTimeout(() => setCopiedPlaceholder(null), 1500);
  };

  const smsLength = watchedSmsBody.length;
  const smsSegments = Math.ceil(smsLength / 160) || 1;

  return (
    <DrawerSection step={3} title="Placeholders & Content" required>
      {/* ── Placeholders Toolbar ────────────────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-txt-main flex items-center gap-1.5">
            <Copy className="w-3.5 h-3.5 text-[#F59E0B]" />
            Click to insert placeholder:
          </span>
          {copiedPlaceholder && (
            <span className="text-[11px] font-bold text-[#059669] animate-pulse">
              Inserted [{copiedPlaceholder}]!
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
          {COMMON_PLACEHOLDERS.map((ph) => (
            <button
              key={ph.value}
              type="button"
              onClick={() => insertPlaceholder(ph.value)}
              title={ph.description}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium bg-[var(--surface)] hover:bg-amber-50 dark:hover:bg-amber-950/30 text-txt-main hover:text-amber-700 dark:hover:text-amber-300 border border-[var(--border)] hover:border-amber-300 transition-all cursor-pointer shadow-2xs"
            >
              +[{ph.value}]
            </button>
          ))}
        </div>
      </div>

      {/* ── Channel Navigation Tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-2 overflow-x-auto">
        {watchedChannels.map((ch) => {
          const isActive = activeChannelTab === ch;
          const opt = CHANNEL_OPTIONS.find((c) => c.value === ch);
          return (
            <button
              key={ch}
              type="button"
              onClick={() => onActiveChannelTabChange(ch)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0F1E36] text-white shadow-xs"
                  : "text-txt-sub hover:text-txt-main hover:bg-[var(--border)]/40"
              }`}
            >
              <span>{opt?.icon}</span>
              <span>{opt?.label || ch}</span>
            </button>
          );
        })}
      </div>

      {/* ── Channel Editors ─────────────────────────────────────────────── */}
      {activeChannelTab === "email" && (
        <div className="space-y-3.5 pt-1">
          <InputField
            name="emailSubject"
            label="Email Subject"
            required
            placeholder="e.g. Reminder: [SERVICETYPE] Filing Due on [DUEDATE]"
            className="font-mono"
            onFocus={() => {
              activeInputRef.current = "emailSubject";
            }}
          />
          <TextareaField
            name="emailBody"
            label="Email Message Body"
            rows={6}
            placeholder="Enter email content..."
            className="font-mono leading-relaxed"
            onFocus={() => {
              activeInputRef.current = "emailBody";
            }}
          />
        </div>
      )}

      {activeChannelTab === "whatsapp" && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-bold text-[var(--text-primary)]">
              WhatsApp Message
            </span>
            <span className="text-[11px] text-txt-sub">
              Supports *bold*, _italics_
            </span>
          </div>
          <TextareaField
            name="whatsappBody"
            rows={7}
            placeholder="Enter WhatsApp template text..."
            className="font-mono leading-relaxed"
            onFocus={() => {
              activeInputRef.current = "whatsappBody";
            }}
          />
        </div>
      )}

      {activeChannelTab === "sms" && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-bold text-[var(--text-primary)]">
              SMS Message
            </span>
            <span className="text-[11px] text-txt-sub font-mono">
              {smsLength} characters (approx {smsSegments} SMS)
            </span>
          </div>
          <TextareaField
            name="smsBody"
            rows={5}
            placeholder="Enter SMS content..."
            className="font-mono leading-relaxed"
            onFocus={() => {
              activeInputRef.current = "smsBody";
            }}
          />
        </div>
      )}

      {activeChannelTab === "in_app" && (
        <div className="space-y-1 pt-1">
          <TextareaField
            name="inAppBody"
            label="In-App Notification Text"
            rows={4}
            placeholder="Enter in-app alert text..."
            className="font-mono leading-relaxed"
            onFocus={() => {
              activeInputRef.current = "inAppBody";
            }}
          />
        </div>
      )}
    </DrawerSection>
  );
}
