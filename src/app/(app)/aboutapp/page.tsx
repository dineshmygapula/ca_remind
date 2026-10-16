"use client";

import {
    BarChart3,
    Users,
    Bell,
    MessageCircle,
    Info,
} from "lucide-react";

const features = [
    {
        icon: BarChart3,
        title: "Work Management",
        description: "Track performance and growth",
    },
    {
        icon: Users,
        title: "Client Management",
        description: "Manage client profiles and service history",
    },
    {
        icon: Bell,
        title: "Smart Reminders",
        description: "Automated follow-ups and notifications",
    },
    {
        icon: MessageCircle,
        title: "Message Templates",
        description: "Email and WhatsApp template management",
    },
];

const stats = [
    {
        value: "500+",
        label: "CA Firms",
    },
    {
        value: "24/7",
        label: "Support",
    },
    {
        value: "99%",
        label: "Uptime",
    },
];

export default function AboutApp() {
    return (
        <div className="min-h-screen bg-[var(--bg)] py-8 text-[var(--text-primary)]">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">

                    {/* Page Header */}
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                                <Info className="h-[18px] w-[18px] text-[var(--primary)]" />
                            </div>

                            <h1 className="text-2xl font-bold text-[var(--heading)]">
                                About App
                            </h1>
                        </div>

                        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                            Learn more about RemindCA and its features
                        </p>
                    </div>

                    {/* Hero Card */}
                    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">

                                {/* Branding */}
                                <div>
                                    <span className="inline-flex rounded-md bg-[var(--primary)]/10 px-3 py-1.5 text-[0.7rem] font-semibold text-[var(--primary)]">
                                        Version 1.7.16
                                    </span>

                                    <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[var(--primary)] md:text-4xl">
                                        RemindCA
                                    </h2>

                                    <p className="mt-2 text-base text-[var(--text-secondary)]">
                                        Get your business under control
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex shrink-0 overflow-hidden rounded-xl border border-[var(--border)]">
                                    {stats.map((stat, index) => (
                                        <div
                                            key={stat.label}
                                            className={`px-5 py-4 text-center sm:px-6 ${index !== 0
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

                    {/* About RemindCA */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <div className="p-6 md:p-7">

                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                                    <Info className="h-[18px] w-[18px] text-[var(--primary)]" />
                                </div>

                                <h2 className="text-xl font-bold text-[var(--heading)]">
                                    About RemindCA
                                </h2>
                            </div>

                            <p className="text-base leading-7 text-[var(--text-secondary)]">
                                RemindCA is a comprehensive business management solution that
                                helps you streamline operations, manage clients, and automate
                                communications. Perfect for service-based businesses looking to
                                digitize their workflows and improve client relationships.
                            </p>
                        </div>
                    </div>

                    {/* Key Features */}
                    <section>
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--heading)]">
                                    Key Features
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                    Tools built for modern CA firms
                                </p>
                            </div>

                            <span className="w-fit rounded-md bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)]">
                                {features.length} Features
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.title}
                                        className="group h-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-md"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start gap-4">

                                                {/* Icon */}
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                                                    <Icon className="h-5 w-5" />
                                                </div>

                                                <div>
                                                    <h3 className="text-base font-bold text-[var(--heading)]">
                                                        {feature.title}
                                                    </h3>

                                                    <p className="mt-1.5 text-sm leading-7 text-[var(--text-secondary)]">
                                                        {feature.description}
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Developer Footer */}
                    <section>
                        <div className="mb-6 h-px bg-[var(--border)]" />

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm md:p-8">

                            <span className="inline-flex rounded-md bg-[var(--primary)]/10 px-3 py-1.5 text-[0.7rem] font-semibold text-[var(--primary)]">
                                Developed by
                            </span>

                            <h3 className="mt-3 text-xl font-extrabold tracking-tight text-[var(--heading)] md:text-2xl">
                                ICEAPPLE SOFT PVT LTD
                            </h3>

                            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--text-secondary)]">
                                Start managing clients and automating workflows with RemindCA
                                today!
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}