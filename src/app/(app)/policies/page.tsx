"use client";

import {
    ShieldCheck,
    ShieldAlert,
    FileText,
    LockKeyhole,
    Cookie,
    ChevronRight,
} from "lucide-react";

const legalItems = [
    {
        icon: ShieldAlert,
        title: "Privacy Policy",
        description:
            "Learn how we collect, use, and protect your personal information.",
    },
    {
        icon: FileText,
        title: "Terms & Conditions",
        description:
            "Understand your rights and responsibilities when using RemindCA.",
    },
    {
        icon: LockKeyhole,
        title: "Data Protection",
        description:
            "Information about how we secure and handle your business data.",
    },
    {
        icon: Cookie,
        title: "Cookie Policy",
        description:
            "Learn about cookies and tracking technologies we use.",
    },
];

const stats = [
    {
        value: `${legalItems.length}`,
        label: "Documents",
    },
    {
        value: "2025",
        label: "Updated",
    },
    {
        value: "GDPR",
        label: "Compliant",
    },
];

export default function PoliciesLegalPage() {
    return (
        <div className="min-h-screen bg-[var(--bg)] py-8 text-[var(--text-primary)]">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">

                    {/* Page Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                                    <ShieldCheck className="h-[18px] w-[18px] text-[var(--primary)]" />
                                </div>

                                <h1 className="text-2xl font-bold text-[var(--heading)]">
                                    Policies & Legal
                                </h1>
                            </div>

                            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                                Important legal documents and policies for RemindCA users
                            </p>
                        </div>

                        <span className="w-fit rounded-md bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)]">
                            Last Updated: Jan 2025
                        </span>
                    </div>

                    {/* Hero Card */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">

                                {/* Left */}
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                                        <ShieldCheck className="h-7 w-7 text-[var(--primary)]" />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-[var(--primary)]">
                                            Legal Information
                                        </h2>

                                        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                                            Transparency and trust — our commitment to you
                                        </p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex shrink-0 overflow-hidden rounded-xl border border-[var(--border)]">
                                    {stats.map((stat, index) => (
                                        <div
                                            key={stat.label}
                                            className={`min-w-[95px] px-4 py-4 text-center sm:px-5 ${index !== 0
                                                    ? "border-l border-[var(--border)]"
                                                    : ""
                                                }`}
                                        >
                                            <div className="text-xl font-extrabold text-[var(--primary)]">
                                                {stat.value}
                                            </div>

                                            <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Legal Documents */}
                    <section>
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-[var(--heading)]">
                                Legal Documents
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Review our policies and terms carefully
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {legalItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.title}
                                        type="button"
                                        className="group w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4 p-6">

                                            {/* Icon */}
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-bold text-[var(--heading)]">
                                                    {item.title}
                                                </h3>

                                                <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-200 group-hover:translate-x-1">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>

                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Footer */}
                    <section>
                        <div className="mb-6 h-px bg-[var(--border)]" />

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="flex flex-col items-start justify-between gap-3 p-6 sm:flex-row sm:items-center md:p-7">

                                <div>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">
                                        © 2025 ICEAPPLE SOFT PVT LTD.
                                    </p>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        All Rights Reserved.
                                    </p>
                                </div>

                                <span className="rounded-md bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
                                    Last Updated: January 2025
                                </span>

                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}