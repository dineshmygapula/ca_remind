"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Settings, Zap, Bell } from "lucide-react";
import DrawerSection from "@/components/common/DrawerSection";
import { TaskDefinitionFormValues } from "@/utils/schema";

export default function TaskDefinitionAutomationSection() {
  const { watch, setValue } = useFormContext<TaskDefinitionFormValues>();

  const watchedIsActive = watch("isActive");
  const watchedAutoCreateTasks = watch("autoCreateTasks");
  const watchedAutoCreateReminders = watch("autoCreateReminders");

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
          <div
            role="switch"
            aria-checked={watchedIsActive}
            tabIndex={0}
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() =>
              setValue("isActive", !watchedIsActive, { shouldDirty: true })
            }
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setValue("isActive", !watchedIsActive, { shouldDirty: true });
              }
            }}
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
          </div>
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
          <div
            role="switch"
            aria-checked={watchedAutoCreateTasks}
            tabIndex={0}
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() =>
              setValue("autoCreateTasks", !watchedAutoCreateTasks, {
                shouldDirty: true,
              })
            }
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setValue("autoCreateTasks", !watchedAutoCreateTasks, {
                  shouldDirty: true,
                });
              }
            }}
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
          </div>
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
          <div
            role="switch"
            aria-checked={watchedAutoCreateReminders}
            tabIndex={0}
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() =>
              setValue("autoCreateReminders", !watchedAutoCreateReminders, {
                shouldDirty: true,
              })
            }
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setValue("autoCreateReminders", !watchedAutoCreateReminders, {
                  shouldDirty: true,
                });
              }
            }}
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
          </div>
        </div>
      </div>
    </DrawerSection>
  );
}
