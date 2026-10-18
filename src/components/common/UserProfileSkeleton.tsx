"use client";

import React from "react";

export default function UserProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg py-10 animate-fade-in">
      <div className="mx-auto max-w-[1240px] space-y-6 px-4 sm:px-6">
        {/* Page header */}
        <div className="space-y-2">
          <div className="skeleton h-8 sm:h-9 w-40 rounded-lg" />
          <div className="skeleton h-4 w-72 sm:w-96 rounded-md" />
        </div>

        {/* Profile hero */}
        <section className="relative overflow-hidden rounded-[20px] bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="skeleton h-[72px] w-[72px] shrink-0 rounded-2xl" />

              {/* Name & tags */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="skeleton h-7 w-48 rounded-lg" />
                  <div className="skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton h-5 w-24 rounded-full" />
                </div>
                <div className="skeleton h-4 w-56 rounded-md" />
                <div className="skeleton h-3.5 w-40 rounded-md" />
              </div>
            </div>

            {/* Header action button */}
            <div className="skeleton h-12 w-36 rounded-[14px] shrink-0" />
          </div>
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left two columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal information card */}
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-5 w-44 rounded-md" />
                    <div className="skeleton h-3.5 w-60 rounded-md" />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-24 rounded-md" />
                    <div className="skeleton h-12 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-24 rounded-md" />
                    <div className="skeleton h-12 w-full rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-28 rounded-md" />
                    <div className="skeleton h-12 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-28 rounded-md" />
                    <div className="skeleton h-12 w-full rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="skeleton h-4 w-32 rounded-md" />
                  <div className="skeleton h-12 w-full rounded-xl" />
                </div>
              </div>
            </section>

            {/* Subscription & plan card */}
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-5 w-40 rounded-md" />
                    <div className="skeleton h-3.5 w-52 rounded-md" />
                  </div>
                </div>
                <div className="skeleton h-4 w-24 rounded-md" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-2"
                  >
                    <div className="skeleton h-3 w-16 rounded-md" />
                    <div className="skeleton h-6 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Account credentials */}
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="skeleton h-5 w-32 rounded-md" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-28 rounded-md" />
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>

                <div className="space-y-2">
                  <div className="skeleton h-4 w-24 rounded-md" />
                  <div className="skeleton h-12 w-full rounded-xl" />
                </div>

                <div className="space-y-2.5 pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between">
                    <div className="skeleton h-3.5 w-28 rounded-md" />
                    <div className="skeleton h-3.5 w-20 rounded-md" />
                  </div>
                  <div className="flex justify-between">
                    <div className="skeleton h-3.5 w-24 rounded-md" />
                    <div className="skeleton h-3.5 w-20 rounded-md" />
                  </div>
                </div>
              </div>
            </section>

            {/* Quick links */}
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
              <div className="skeleton h-5 w-32 rounded-md mb-2" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-12 w-full rounded-xl" />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
