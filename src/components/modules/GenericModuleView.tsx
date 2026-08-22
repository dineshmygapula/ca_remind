"use client";

import { Sparkles } from "lucide-react";
import { NavTab } from "@/types";

interface GenericModuleViewProps {
  activeTab: NavTab;
  subtitle: string;
}

export function GenericModuleView({ activeTab, subtitle }: GenericModuleViewProps) {
  return (
    <div className="p-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-[var(--heading)]">{activeTab} Module</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mt-2">
        {subtitle}
      </p>
    </div>
  );
}
