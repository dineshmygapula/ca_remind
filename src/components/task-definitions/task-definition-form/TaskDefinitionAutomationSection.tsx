"use client";

import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Settings, Zap, Bell } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import { TaskDefinitionFormValues } from "@/utils/schema";

export default function TaskDefinitionAutomationSection() {
  const { setValue, control } = useFormContext<TaskDefinitionFormValues>();

  const watchedIsActive = useWatch({ control, name: "isActive" }) ?? true;
  const watchedAutoCreateTasks =
    useWatch({ control, name: "autoCreateTasks" }) ?? false;
  const watchedAutoCreateReminders =
    useWatch({ control, name: "autoCreateReminders" }) ?? false;

  const handleToggle = (
    field: "isActive" | "autoCreateTasks" | "autoCreateReminders",
    currentVal: boolean
  ) => {
    setValue(field, !currentVal, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <DrawerSection step={3} title="Automation & Status">
      <div className="divide-y divide-[var(--border)]">
        {/* Active Status */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                watchedIsActive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-txt-main">Rule Status</p>
              <p className="text-[11px] text-txt-sub">
                Enable or disable this task rule
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(watchedIsActive)}
            className="flex items-center gap-2 cursor-pointer select-none bg-transparent border-0 p-0"
            onClick={() => handleToggle("isActive", Boolean(watchedIsActive))}
          >
            <div
              className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                watchedIsActive
                  ? "bg-[#0F1E36] dark:bg-navy"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                  watchedIsActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span
              className={`text-xs font-semibold ${
                watchedIsActive ? "text-[#059669]" : "text-txt-sub"
              }`}
            >
              {watchedIsActive ? "Active" : "Inactive"}
            </span>
          </button>
        </div>

        {/* Auto Tasks */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                watchedAutoCreateTasks
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-txt-main">Auto-create Tasks</p>
              <p className="text-[11px] text-txt-sub">
                Automatically generate task instances on due dates
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(watchedAutoCreateTasks)}
            className="flex items-center gap-2 cursor-pointer select-none bg-transparent border-0 p-0"
            onClick={() =>
              handleToggle("autoCreateTasks", Boolean(watchedAutoCreateTasks))
            }
          >
            <div
              className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                watchedAutoCreateTasks
                  ? "bg-[#0F1E36] dark:bg-navy"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                  watchedAutoCreateTasks ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span
              className={`text-xs font-semibold ${
                watchedAutoCreateTasks ? "text-txt-main" : "text-txt-sub"
              }`}
            >
              {watchedAutoCreateTasks ? "On" : "Off"}
            </span>
          </button>
        </div>

        {/* Auto Reminders */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                watchedAutoCreateReminders
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800"
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-txt-main">
                Auto-create Reminders
              </p>
              <p className="text-[11px] text-txt-sub">
                Automatically schedule client notifications
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(watchedAutoCreateReminders)}
            className="flex items-center gap-2 cursor-pointer select-none bg-transparent border-0 p-0"
            onClick={() =>
              handleToggle(
                "autoCreateReminders",
                Boolean(watchedAutoCreateReminders)
              )
            }
          >
            <div
              className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors relative ${
                watchedAutoCreateReminders
                  ? "bg-[#0F1E36] dark:bg-navy"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${
                  watchedAutoCreateReminders ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span
              className={`text-xs font-semibold ${
                watchedAutoCreateReminders ? "text-txt-main" : "text-txt-sub"
              }`}
            >
              {watchedAutoCreateReminders ? "On" : "Off"}
            </span>
          </button>
        </div>
      </div>
    </DrawerSection>
  );
}
