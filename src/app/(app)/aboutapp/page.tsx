"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import {
  BarChart3,
  Users,
  Bell,
  MessageCircle,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Zap,
  Lock,
  Headphones,
  Award,
  Globe2,
  CalendarCheck2,
  Building2,
  Layers,
  HeartHandshake,
  Check,
  ChevronRight,
} from "lucide-react";

const STATS = [
  { value: "500+", label: "CA Firms", detail: "Across 24+ states in India" },
  { value: "250K+", label: "Reminders Sent", detail: "Via WhatsApp, SMS & Email" },
  { value: "99.9%", label: "Platform Uptime", detail: "High-availability SLA" },
  { value: "10+ Hrs", label: "Weekly Saved", detail: "Per firm on compliance follow-ups" },
];

const CORE_PILLARS = [
  {
    id: "compliance",
    title: "Statutory Compliance Automation",
    badge: "Deadlines Engine",
    icon: CalendarCheck2,
    tagline: "Never miss a GST, Income Tax, ROC, or TDS cutoff again.",
    description:
      "RemindCA tracks statutory tax and audit deadlines nationwide, synchronizing recurring compliance tasks with automatic countdowns and team assignments.",
    highlights: [
      "GST returns tracking (GSTR-1, 3B, 9, 9C)",
      "Income Tax filing & Advance Tax payment reminders",
      "MCA & ROC annual returns & DIN e-KYC schedules",
      "TDS / TCS quarterly compliance & challan verifications",
    ],
  },
  {
    id: "messaging",
    title: "Omnichannel Client Communication",
    badge: "Smart Messaging",
    icon: MessageCircle,
    tagline: "Reach clients where they actually respond — instantly.",
    description:
      "Send professional, automated notifications via WhatsApp Business API, branded Email, and SMS with customizable templates and instant client acknowledgement tracking.",
    highlights: [
      "Official WhatsApp integration with 1-click delivery",
      "Dynamic token replacement (client name, due date, firm header)",
      "Read receipts & digital client acknowledgement logging",
      "Scheduled follow-ups with customizable 'Days Before Due' triggers",
    ],
  },
  {
    id: "clients",
    title: "360° Client & Service Master",
    badge: "Practice CRM",
    icon: Users,
    tagline: "Unified client database tailored to professional accounting.",
    description:
      "Consolidate client entities (Proprietorships, Partnerships, Pvt Ltd, LLPs, Trusts) with their active service portfolios, key contact points, and secure document attachments.",
    highlights: [
      "Entity-specific tracking (PAN, GSTIN, TAN, CIN)",
      "Multi-service tagging (GST, ITR, Audits, Accounting)",
      "Internal private notes visible only to firm personnel",
      "Document vault with secure PDF and certificate storage",
    ],
  },
  {
    id: "orchestration",
    title: "Firm Governance & Team Productivity",
    badge: "Workload Orchestration",
    icon: BarChart3,
    tagline: "Total visibility across partners, managers, and article clerks.",
    description:
      "Distribute assignments, track overdue versus upcoming items in real time, and gain granular visibility over team efficiency without messy spreadsheets.",
    highlights: [
      "Role-based access control (Partners, Staff, Article Assistants)",
      "Overdue, Due Today, and Upcoming task dashboards",
      "Automated internal staff reminders prior to client due dates",
      "Comprehensive audit trail for every reminder dispatched",
    ],
  },
];

const SECURITY_STANDARDS = [
  {
    icon: Lock,
    title: "Bank-Grade Encryption",
    description:
      "All client data, tax credentials, and confidential communications are protected using 256-bit AES encryption at rest and TLS 1.3 in transit.",
  },
  {
    icon: ShieldCheck,
    title: "Workspace Tenant Isolation",
    description:
      "Every CA firm operates inside a logically isolated tenant partition. Your client lists and internal notes are never accessible by other firms.",
  },
  {
    icon: Award,
    title: "DPDP & Regulatory Compliance",
    description:
      "Engineered in alignment with the Indian Digital Personal Data Protection (DPDP) Act 2023 and the Information Technology Act provisions.",
  },
  {
    icon: Zap,
    title: "Cloud High Availability",
    description:
      "Hosted on enterprise cloud infrastructure with continuous automated backups, geographical failover, and guaranteed 99.9% uptime SLA.",
  },
];

const VERSION_HISTORY = [
  {
    version: "v1.7.16",
    tag: "Current Release",
    date: "January 2025",
    features: [
      "Enhanced WhatsApp Business template variable engine",
      "Refactored high-performance right-side drawer experience",
      "Instant client search with service-type filtering",
      "Automated recurrence rules for quarterly compliance reminders",
    ],
  },
  {
    version: "v1.7.0",
    tag: "Milestone",
    date: "December 2024",
    features: [
      "Comprehensive Subscriptions & Invoicing Portal integration",
      "Support for multi-tier firm organizations and staff delegation",
      "Dark mode aesthetic enhancement across all workspace modules",
    ],
  },
];

export default function AboutApp() {
  const [activePillar, setActivePillar] = useState(0);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-16 pt-6 text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">

          {/* Breadcrumb & Top Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Link href="/dashboard" className="transition-colors hover:text-[var(--primary)]">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-[var(--text-primary)]">About RemindCA</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                All Systems Operational • v1.7.16
              </span>
            </div>
          </div>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            {/* Subtle decorative background gradient */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[var(--accent)]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[var(--primary)]/10 blur-3xl" />

            <div className="relative p-6 sm:p-10 lg:p-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                
                {/* Left: Branding & Core Headline */}
                <div className="max-w-2xl space-y-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3.5 py-1 text-xs font-bold text-[var(--primary)] dark:border-[var(--accent)]/30 dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Built for Indian Chartered Accountants
                    </span>
                    <span className="rounded-full bg-[var(--border)]/60 px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                      Enterprise Suite v1.7.16
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Logo />
                  </div>

                  <h1 className="text-3xl font-extrabold tracking-tight text-[var(--heading)] sm:text-4xl lg:text-5xl">
                    Intelligent Practice Automation for Chartered Accountants
                  </h1>

                  <p className="text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                    RemindCA eliminates spreadsheet chaos, prevents missed statutory deadlines, and automates multi-channel client communications for forward-thinking Indian CA firms, tax consultants, and financial advisory teams.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href="/help&support"
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--primary-hover)] hover:shadow-md dark:bg-[var(--accent)] dark:text-[#0b1220] dark:hover:bg-[var(--accent-hover)]"
                    >
                      <Headphones className="h-4 w-4" />
                      Help & Knowledge Base
                    </Link>

                    <Link
                      href="/policies"
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                    >
                      <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                      Legal & Security Policies
                    </Link>

                    <Link
                      href="/talkwithagent"
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                    >
                      <span>Talk with Agent</span>
                      <ArrowRight className="h-4 w-4 text-[var(--primary)]" />
                    </Link>
                  </div>
                </div>

                {/* Right: Key Impact Metric Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-[420px] lg:shrink-0">
                  {STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-[var(--surface)] hover:shadow-sm sm:p-5"
                    >
                      <div className="text-2xl font-black tracking-tight text-[var(--primary)] dark:text-[var(--accent)] sm:text-3xl">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--heading)]">
                        {stat.label}
                      </div>
                      <div className="mt-1 text-[11px] leading-tight text-[var(--text-secondary)]">
                        {stat.detail}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Mission & Purpose */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--heading)]">Our Mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                To liberate Indian Chartered Accountants from routine operational chaos, empower article clerks with clear workflows, and guarantee zero client compliance penalties across all taxation brackets.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--heading)]">Why Spreadsheets Fail</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Traditional spreadsheets cannot auto-dispatch WhatsApp notifications, lack client read-receipt verification, provide no audit trails for compliance disputes, and easily get misplaced during audits.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--heading)]">Built for Firms of Any Scale</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Whether you are a solo practitioner managing 50 tax clients or a mid-sized firm coordinating 1,000+ corporate GST and ROC mandates with 20 team members, RemindCA scales effortlessly.
              </p>
            </div>
          </div>

          {/* Core Platform Pillars (Interactive showcase) */}
          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent)]">
                  Platform Architecture
                </span>
                <h2 className="mt-1 text-2xl font-bold text-[var(--heading)] sm:text-3xl">
                  Core Pillars of RemindCA
                </h2>
              </div>
              <p className="max-w-md text-sm text-[var(--text-secondary)]">
                Click across the core pillars below to explore how RemindCA powers every aspect of your practice.
              </p>
            </div>

            {/* Pillar Selector Pills */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {CORE_PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                const isActive = activePillar === idx;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillar(idx)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--surface)] shadow-md ring-2 ring-[var(--primary)]/20 dark:border-[var(--accent)] dark:ring-[var(--accent)]/20"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40 hover:bg-[var(--border)]/30"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? "bg-[var(--primary)] text-white dark:bg-[var(--accent)] dark:text-[#0b1220]"
                          : "bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                        {pillar.badge}
                      </div>
                      <div className="truncate text-xs font-bold text-[var(--heading)] sm:text-sm">
                        {pillar.title.split(" ")[0]} {pillar.title.split(" ")[1]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Pillar Detail Box */}
            {(() => {
              const current = CORE_PILLARS[activePillar];
              const Icon = current.icon;
              return (
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 lg:p-10 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)]/10 px-3 py-1 text-xs font-bold text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                        <Icon className="h-4 w-4" />
                        {current.badge}
                      </div>

                      <h3 className="text-2xl font-extrabold text-[var(--heading)] sm:text-3xl">
                        {current.title}
                      </h3>

                      <p className="text-base font-medium text-[var(--primary)] dark:text-[var(--accent)]">
                        {current.tagline}
                      </p>

                      <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                        {current.description}
                      </p>
                    </div>

                    {/* Feature Checklist */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/80 p-5 lg:w-[420px] lg:shrink-0">
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--heading)]">
                        Key Capabilities Included
                      </div>
                      <div className="mt-4 space-y-3">
                        {current.highlights.map((item) => (
                          <div key={item} className="flex items-start gap-2.5">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium text-[var(--text-primary)] sm:text-sm">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Security & Regulatory Compliance */}
          <section className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent)]">
                Trust & Confidentiality
              </span>
              <h2 className="mt-1 text-2xl font-bold text-[var(--heading)] sm:text-3xl">
                Enterprise-Grade Security Standards
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
                Tax records, client details, and financial notices demand unwavering discretion. RemindCA is engineered from the ground up to protect your firm’s reputation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SECURITY_STANDARDS.map((sec) => {
                const SecIcon = sec.icon;
                return (
                  <div
                    key={sec.title}
                    className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                      <SecIcon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[var(--heading)]">{sec.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                      {sec.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Release History & System Specs */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* System Specifications */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <Layers className="h-5 w-5 text-[var(--primary)] dark:text-[var(--accent)]" />
                <h3 className="text-base font-bold text-[var(--heading)]">System Specifications</h3>
              </div>
              <div className="mt-5 divide-y divide-[var(--border)] text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-[var(--text-secondary)]">Application Build</span>
                  <span className="font-semibold text-[var(--text-primary)]">v1.7.16 (2025.4-LTS)</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-[var(--text-secondary)]">Deployment Model</span>
                  <span className="font-semibold text-[var(--text-primary)]">Multi-Tenant Cloud SaaS</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-[var(--text-secondary)]">WhatsApp Gateway</span>
                  <span className="font-semibold text-[var(--text-primary)]">Meta Cloud Business API</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-[var(--text-secondary)]">Email Delivery</span>
                  <span className="font-semibold text-[var(--text-primary)]">SPF / DKIM Authenticated</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-[var(--text-secondary)]">Target Jurisdiction</span>
                  <span className="font-semibold text-[var(--text-primary)]">Republic of India</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-[var(--text-secondary)]">Operating Organization</span>
                  <span className="font-semibold text-[var(--text-primary)]">ICEAPPLE SOFT PVT LTD</span>
                </div>
              </div>
            </div>

            {/* Version Updates Log */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="h-5 w-5 text-[var(--primary)] dark:text-[var(--accent)]" />
                  <h3 className="text-base font-bold text-[var(--heading)]">Recent Release Highlights</h3>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Latest Build
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {VERSION_HISTORY.map((ver) => (
                  <div key={ver.version} className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--heading)]">{ver.version}</span>
                        <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                          {ver.tag}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">{ver.date}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {ver.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Corporate Provenance Footer Card */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  <Globe2 className="h-3.5 w-3.5" />
                  Engineered & Maintained By
                </span>
                <h3 className="text-2xl font-black text-[var(--heading)]">
                  ICEAPPLE SOFT PVT LTD
                </h3>
                <p className="max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                  RemindCA is developed by Iceapple Soft Pvt Ltd, dedicated to building specialized digital tools and enterprise workflow engines for the Indian chartered accountancy and tax advisory ecosystem.
                </p>
                <div className="pt-2 text-xs text-[var(--text-secondary)]">
                  © {new Date().getFullYear()} ICEAPPLE SOFT PVT LTD. All Rights Reserved.
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row shrink-0">
                <Link
                  href="/policies"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all hover:border-[var(--primary)] hover:bg-[var(--surface)]"
                >
                  <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                  Legal Terms & Privacy
                </Link>

                <Link
                  href="/help&support"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all hover:border-[var(--primary)] hover:bg-[var(--surface)]"
                >
                  <Headphones className="h-4 w-4 text-[var(--primary)]" />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}