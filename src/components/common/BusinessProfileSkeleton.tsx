"use client";

import React from "react";

export default function BusinessProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg py-8 animate-fade-in">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        {/* Executive Hero Banner Skeleton */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar / Brand Icon */}
              <div className="skeleton h-20 w-20 shrink-0 rounded-2xl" />

              {/* Title & tags */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="skeleton h-7 w-52 rounded-lg" />
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-5 w-20 rounded-full" />
                </div>
                <div className="skeleton h-4 w-44 rounded-md" />
                <div className="skeleton h-3.5 w-60 rounded-md" />
              </div>
            </div>

            {/* Header Action Button */}
            <div className="skeleton h-9 w-36 rounded-xl shrink-0" />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Firm Overview Card */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="skeleton h-8 w-8 rounded-xl" />
                  <div className="space-y-1">
                    <div className="skeleton h-4 w-44 rounded-md" />
                    <div className="skeleton h-3 w-56 rounded-md" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="skeleton h-3 w-32 rounded-md" />
                    <div className="skeleton h-9 w-full rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="skeleton h-3 w-28 rounded-md" />
                    <div className="skeleton h-9 w-full rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="skeleton h-3 w-36 rounded-md" />
                    <div className="skeleton h-9 w-full rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="skeleton h-3 w-32 rounded-md" />
                    <div className="skeleton h-9 w-full rounded-xl" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="skeleton h-3 w-48 rounded-md" />
                  <div className="skeleton h-9 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Registered Address Card */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="skeleton h-8 w-8 rounded-xl" />
                  <div className="space-y-1">
                    <div className="skeleton h-4 w-44 rounded-md" />
                    <div className="skeleton h-3 w-64 rounded-md" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded-md" />
                <div className="skeleton h-3.5 w-1/2 rounded-md" />
              </div>
            </div>

            {/* Notes & Bio Card */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                <div className="skeleton h-4 w-4 rounded-md" />
                <div className="skeleton h-3.5 w-40 rounded-md" />
              </div>
              <div className="skeleton h-20 w-full rounded-2xl" />
            </div>
          </div>

          {/* Right 1 Column */}
          <div className="space-y-6">
            {/* Workspace Identifiers */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                <div className="skeleton h-4 w-4 rounded-md" />
                <div className="skeleton h-3.5 w-36 rounded-md" />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="skeleton h-3 w-28 rounded-md" />
                  <div className="skeleton h-9 w-full rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <div className="skeleton h-3 w-28 rounded-md" />
                  <div className="skeleton h-9 w-full rounded-xl" />
                </div>

                <div className="pt-2 border-t border-[var(--border)]/60 space-y-2">
                  <div className="flex justify-between">
                    <div className="skeleton h-3 w-20 rounded-md" />
                    <div className="skeleton h-3 w-24 rounded-md" />
                  </div>
                  <div className="flex justify-between">
                    <div className="skeleton h-3 w-20 rounded-md" />
                    <div className="skeleton h-3 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Related Settings */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm space-y-3">
              <div className="skeleton h-3.5 w-40 rounded-md mb-2" />
              <div className="space-y-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-10 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
