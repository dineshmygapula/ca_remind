"use client";

import { Search, Plus } from "lucide-react";
import { NavTab } from "@/types";

interface SubHeaderProps {
  activeTab: NavTab;
  subtitle: string;
  actionText: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SubHeader({
  activeTab,
  subtitle,
  actionText,
  searchQuery,
  onSearchChange,
}: SubHeaderProps) {
  return (
    <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-8 py-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--heading)] flex items-center gap-3">
            {activeTab}
            <span className="badge badge-sm font-semibold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 px-3 py-1">
              Active Module
            </span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input input-sm rounded-xl pl-9 bg-[var(--bg)] border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] w-48 sm:w-64"
            />
          </div>

          {/* Action Button */}
          <button className="btn btn-sm rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white border-none shadow-md gap-2 font-bold px-4 dark:bg-[var(--accent)] dark:text-[#0B1220] dark:hover:bg-[var(--accent-hover)] cursor-pointer">
            <Plus className="w-4 h-4 stroke-[3]" />
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}
