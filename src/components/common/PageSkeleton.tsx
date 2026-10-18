"use client";

import React from "react";

export interface PageSkeletonProps {
  /** If true, renders top stat cards (used in task definitions and overview pages) */
  hasStats?: boolean;
  /** Number of stat cards to display. Defaults to 4 */
  statCount?: number;
  /** Number of skeleton rows in the table. Defaults to 7 */
  rowCount?: number;
  /** Number of dropdown filter pills in the filter bar. Defaults to 3 */
  filterCount?: number;
  /** Whether to show the sort dropdown skeleton. Defaults to true */
  hasSort?: boolean;
  /** Custom extra className for the outer container */
  className?: string;
}

/**
 * Common page-level DaisyUI skeleton loader.
 * Matches the visual design of ResourcePageLayout, CommonDataGrid, FilterBar, and StatCards.
 */
export default function PageSkeleton({
  hasStats = false,
  statCount = 4,
  rowCount = 7,
  filterCount = 3,
  hasSort = true,
  className = "",
}: PageSkeletonProps) {
  return (
    <div className={`min-h-screen bg-bg py-8 ${className}`}>
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* ── Page Header Skeleton ── */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-44 rounded-lg" />
            <div className="skeleton h-4 w-72 rounded-md" />
          </div>
          <div className="skeleton h-10 w-36 rounded-xl" />
        </div>

        {/* ── Optional Stat Cards Skeleton ── */}
        {hasStats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: statCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-divider bg-surface p-5 shadow-xs space-y-3"
              >
                <div className="skeleton h-3.5 w-24 rounded-md" />
                <div className="skeleton h-8 w-16 rounded-md" />
                <div className="skeleton h-3 w-32 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* ── Filter Bar Skeleton ── */}
        <div className="rounded-2xl border border-divider bg-surface p-3.5 sm:p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="min-w-[240px] flex-1">
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>

            {/* Filter Dropdown Selectors */}
            {Array.from({ length: filterCount }).map((_, i) => (
              <div
                key={i}
                className="skeleton h-10 w-32 sm:w-36 rounded-xl shrink-0"
              />
            ))}

            {/* Reset Button */}
            <div className="skeleton h-10 w-24 rounded-xl shrink-0" />
          </div>
        </div>

        {/* ── Summary & Sort Skeleton ── */}
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-5 w-24 rounded-md" />
          {hasSort && <div className="skeleton h-9 w-44 rounded-xl" />}
        </div>

        {/* ── Table Card Skeleton ── */}
        <div className="rounded-2xl border border-divider bg-surface shadow-xs overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 border-b border-divider bg-slate-50/70 dark:bg-slate-800/40 px-6 py-4 items-center">
            <div className="col-span-4">
              <div className="skeleton h-4 w-28 rounded-md" />
            </div>
            <div className="col-span-3">
              <div className="skeleton h-4 w-24 rounded-md" />
            </div>
            <div className="col-span-2">
              <div className="skeleton h-4 w-20 rounded-md" />
            </div>
            <div className="col-span-2">
              <div className="skeleton h-4 w-24 rounded-md" />
            </div>
            <div className="col-span-1 flex justify-end">
              <div className="skeleton h-4 w-12 rounded-md" />
            </div>
          </div>

          {/* Table Data Rows */}
          <div className="divide-y divide-divider/50">
            {Array.from({ length: rowCount }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-4 items-center px-6 py-4"
              >
                {/* Column 1: Title / Main text */}
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className="skeleton h-4 rounded-md"
                    style={{
                      width: `${Math.max(45, ((i * 17 + 55) % 45) + 50)}%`,
                    }}
                  />
                </div>

                {/* Column 2: Secondary text */}
                <div className="col-span-3">
                  <div
                    className="skeleton h-4 rounded-md"
                    style={{
                      width: `${Math.max(40, ((i * 23 + 40) % 40) + 45)}%`,
                    }}
                  />
                </div>

                {/* Column 3: Badge / Status */}
                <div className="col-span-2">
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>

                {/* Column 4: Date / Schedule */}
                <div className="col-span-2">
                  <div className="skeleton h-4 w-28 rounded-md" />
                </div>

                {/* Column 5: Action buttons */}
                <div className="col-span-1 flex justify-end gap-2">
                  <div className="skeleton h-7 w-7 rounded-lg shrink-0" />
                  <div className="skeleton h-7 w-7 rounded-lg shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Pagination Footer */}
          <div className="border-t border-divider px-6 py-3.5 flex items-center justify-between bg-surface">
            <div className="skeleton h-4 w-36 rounded-md" />
            <div className="flex items-center gap-2">
              <div className="skeleton h-8 w-20 rounded-lg" />
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div className="skeleton h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
