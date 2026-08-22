"use client";

import { TaskItem } from "@/types";

const sampleTasks: TaskItem[] = [
  { id: 101, name: "Statutory Audit FY 2025-26", assignedTo: "Lakshmi Chintha", priority: "High", progress: 75 },
  { id: 102, name: "Tax Audit Report Form 3CD", assignedTo: "Rohan Sharma", priority: "Medium", progress: 40 },
  { id: 103, name: "TDS Return Q1 Filing", assignedTo: "Priya Nair", priority: "Critical", progress: 90 },
];

export function TasksView() {
  return (
    <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
      <h3 className="text-lg font-bold text-[var(--heading)] mb-4">Assigned Tasks</h3>
      <div className="flex flex-col gap-3">
        {sampleTasks.map((t) => (
          <div key={t.id} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-[var(--heading)]">{t.name}</h4>
              <p className="text-xs text-[var(--text-secondary)]">Assigned to {t.assignedTo}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge badge-sm font-semibold bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30">
                {t.priority}
              </span>
              <span className="font-mono text-xs font-bold text-[var(--heading)]">{t.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
