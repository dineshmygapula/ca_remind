"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Mail, Smartphone, Sparkles } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import Dropdown from "@/components/common/Dropdown";
import SearchableSelect from "@/components/common/SearchableSelect";
import DeliveryChannelSelector from "@/components/common/DeliveryChannelSelector";
import { DAYS_BEFORE_OPTIONS } from "@/constants/taskConstants";
import { MessageTemplateListItem } from "@/types/messageTemplate.types";
import { DeliveryChannel } from "@/types/task.types";
import { SubjectListItem } from "@/types/subject";
import { Business } from "@/types/business";
import { TaskFormValues } from "@/utils/schema";

interface TaskRemindersSectionProps {
  templates: MessageTemplateListItem[];
  templatesLoading: boolean;
  selectedTemplate: MessageTemplateListItem | null;
  onSelectTemplate: (tpl: MessageTemplateListItem | null) => void;
  selectedClient: SubjectListItem | null;
  business: Business | null;
}

export default function TaskRemindersSection({
  templates,
  templatesLoading,
  selectedTemplate,
  onSelectTemplate,
  selectedClient,
  business,
}: TaskRemindersSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TaskFormValues>();

  const watchedRemindersEnabled = watch("remindersEnabled");
  const watchedDeliveryChannel = watch("deliveryChannel");
  const watchedDaysBefore = watch("daysBeforeDueDate");
  const watchedDueDate = watch("dueDate");
  const watchedTaskType = watch("taskType");

  const validDaysBeforeOptions = useMemo(() => {
    if (!watchedDueDate) return DAYS_BEFORE_OPTIONS;
    const days = Math.floor(
      (new Date(watchedDueDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
    );
    return days > 0 ? DAYS_BEFORE_OPTIONS.filter((o) => o.value <= days) : [];
  }, [watchedDueDate]);

  const formatTemplatePreview = (text?: string) => {
    if (!text) return "";
    const clientName = selectedClient?.displayName ?? selectedClient?.businessName ?? "[CLIENT]";
    const dateStr = watchedDueDate
      ? new Date(watchedDueDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "[DUEDATE]";
    return text
      .replace(/\[CLIENTNAME\]|{{clientName}}/gi, clientName)
      .replace(/\[BUSINESSNAME\]|{{businessName}}/gi, selectedClient?.businessName || clientName)
      .replace(/\[DUEDATE\]|{{dueDate}}/gi, dateStr)
      .replace(/\[SERVICETYPE\]|{{taskType}}/gi, watchedTaskType || "[SERVICETYPE]")
      .replace(/\[YOURFIRMNAME\]|{{yourFirmName}}/gi, business?.name || "[FIRM]")
      .replace(/\[YOURCONTACTNUMBER\]|{{yourContactNumber}}/gi, business?.phone || "[PHONE]");
  };

  return (
    <DrawerSection
      step={3}
      title="Automated Reminders"
      action={
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() =>
            setValue("remindersEnabled", !watchedRemindersEnabled, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        >
          <div
            className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
              watchedRemindersEnabled
                ? "bg-[#0F1E36] dark:bg-navy"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                watchedRemindersEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span
            className={`text-xs font-semibold ${
              watchedRemindersEnabled ? "text-txt-main" : "text-txt-sub"
            }`}
          >
            {watchedRemindersEnabled ? "On" : "Off"}
          </span>
        </div>
      }
    >
      {watchedRemindersEnabled ? (
        <div className="space-y-4 pt-1">
          {/* Delivery Channel 3 Cards */}
          <DeliveryChannelSelector
            value={watchedDeliveryChannel}
            onChange={(ch) =>
              setValue("deliveryChannel", ch, {
                shouldDirty: true,
              })
            }
          />

          {/* Days Before Due */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-txt-main">
              Days Before Due
            </label>
            <Dropdown
              fullWidth
              disabled={!watchedDueDate}
              value={String(watchedDaysBefore)}
              placeholder="Select days"
              options={validDaysBeforeOptions.map((opt) => ({
                value: String(opt.value),
                label: opt.label,
              }))}
              onChange={(val) => {
                setValue("daysBeforeDueDate", Number(val), {
                  shouldDirty: true,
                });
              }}
            />
            <p className="text-[11px] text-txt-sub leading-snug mt-1">
              {watchedDueDate ? "Days ahead to send" : "Pick a due date first"}
            </p>
          </div>

          {/* Message Template Selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-txt-main">
                Message Template <span className="text-red-500">*</span>
              </label>
            </div>
            <p className="text-[11px] text-txt-sub leading-snug -mt-0.5">
              Matched to task type & channel
            </p>
            <SearchableSelect
              options={templates}
              value={selectedTemplate}
              onChange={(template) => {
                onSelectTemplate(template);
                setValue("templateId", template?.id ?? "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              getOptionLabel={(t) => t.name}
              getOptionKey={(t) => t.id}
              loading={templatesLoading}
              placeholder="Search and select template"
              emptyMessage={
                templates.length === 0
                  ? "No templates found. Create a template first."
                  : "No matching templates"
              }
              renderOption={(t) => (
                <div>
                  <p className="font-semibold text-txt-main">{t.name}</p>
                  <p className="text-xs text-txt-sub">
                    {t.businessCategory}
                    {t.channels?.length ? ` · ${t.channels.join(", ")}` : ""}
                  </p>
                </div>
              )}
            />
            {errors.templateId && (
              <p className="mt-1 text-xs font-medium leading-4 text-red-500">
                {errors.templateId.message}
              </p>
            )}

            {/* Template preview card */}
            {selectedTemplate && (
              <div className="mt-3 rounded-xl border border-divider bg-bg/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <p className="text-xs font-bold text-txt-main">Template Preview</p>
                </div>
                <div className="text-xs text-txt-sub leading-relaxed">
                  {watchedDeliveryChannel === "EMAIL" && selectedTemplate.templates?.email ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-txt-main">
                        {formatTemplatePreview(selectedTemplate.templates.email.subject)}
                      </p>
                      <p className="whitespace-pre-line text-txt-sub">
                        {formatTemplatePreview(selectedTemplate.templates.email.body)}
                      </p>
                    </div>
                  ) : watchedDeliveryChannel === "EMAIL" ? (
                    <p className="italic text-txt-sub/60">No Email content in this template</p>
                  ) : null}

                  {watchedDeliveryChannel === "WHATSAPP" && selectedTemplate.templates?.whatsapp ? (
                    <p className="whitespace-pre-line text-txt-sub">
                      💬 {formatTemplatePreview(selectedTemplate.templates.whatsapp.body)}
                    </p>
                  ) : watchedDeliveryChannel === "WHATSAPP" ? (
                    <p className="italic text-txt-sub/60">No WhatsApp content in this template</p>
                  ) : null}

                  {watchedDeliveryChannel !== "EMAIL" &&
                    watchedDeliveryChannel !== "WHATSAPP" && (
                      <p className="italic text-txt-sub/60">
                        No preview for {watchedDeliveryChannel}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-txt-sub py-1">
          Automated reminders are turned off for this task. Turn on to configure notifications.
        </p>
      )}
    </DrawerSection>
  );
}
