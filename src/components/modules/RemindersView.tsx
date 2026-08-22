"use client";

import { Bell, Clock, CheckCircle2, TrendingUp, Calendar, Filter } from "lucide-react";
import { ReminderItem } from "@/types";

const sampleReminders: ReminderItem[] = [
  { id: 1, title: "GSTR-3B Tax Filing Reminder", client: "Apex Tech Solutions", dueDate: "2026-08-20", status: "Scheduled", type: "WhatsApp & Email" },
  { id: 2, title: "Advance Tax Q2 Payment Alert", client: "Zenith Enterprises", dueDate: "2026-09-15", status: "Pending", type: "SMS Alert" },
  { id: 3, title: "ROC Annual Return Form MGT-7", client: "Global Trade Logistics", dueDate: "2026-10-30", status: "Completed", type: "Email Notification" },
];

export function RemindersView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
          <div className="flex justify-between items-center text-[var(--text-secondary)] text-xs font-semibold mb-2">
            <span>TOTAL REMINDERS</span>
            <Bell className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--heading)]">48</div>
          <p className="text-xs text-[var(--accent)] mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +12 scheduled this week
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
          <div className="flex justify-between items-center text-[var(--text-secondary)] text-xs font-semibold mb-2">
            <span>PENDING CONFIRMATIONS</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--heading)]">9</div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Awaiting client response</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
          <div className="flex justify-between items-center text-[var(--text-secondary)] text-xs font-semibold mb-2">
            <span>DELIVERED (THIS MONTH)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--heading)]">132</div>
          <p className="text-xs text-emerald-500 mt-1 font-medium">99.4% delivery rate</p>
        </div>
      </div>

      {/* Reminders Notification Table */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[var(--heading)]">Active Notifications & Alerts</h3>
          <button className="btn btn-xs rounded-lg border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {sampleReminders.map((rem) => (
            <div
              key={rem.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--heading)]">{rem.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{rem.client} • {rem.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{rem.dueDate}</span>
                </div>
                <span
                  className={`badge badge-sm font-semibold px-2.5 ${
                    rem.status === "Scheduled"
                      ? "bg-sky-500/15 text-sky-500 border-sky-500/30"
                      : rem.status === "Pending"
                      ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                  }`}
                >
                  {rem.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
