'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PublicHeader } from '@/components/layout/PublicHeader';
import {
  CalendarCheck2,
  MessageCircle,
  Users,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  Headphones,
  CheckCircle2,
  Clock,
  Lock,
  Layers,
  ChevronDown,
  Search,
  FileText,
  HelpCircle,
  Info,
  Check,
  TrendingUp,
  Building2,
  Loader2,
  Globe2,
  Award,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Data Constants
// ─────────────────────────────────────────────

const STATS = [
  { value: '500+', label: 'CA Firms', detail: 'Across 24+ states in India' },
  { value: '250K+', label: 'Reminders Sent', detail: 'Via WhatsApp, SMS & Email' },
  { value: '99.9%', label: 'Platform Uptime', detail: 'High-availability SLA' },
  { value: '10+ Hrs', label: 'Weekly Saved', detail: 'Per firm on client follow-ups' },
];

const CORE_PILLARS = [
  {
    id: 'compliance',
    title: 'Statutory Compliance Automation',
    badge: 'Deadlines Engine',
    icon: CalendarCheck2,
    tagline: 'Never miss a GST, Income Tax, ROC, or TDS cutoff again.',
    description:
      'RemindCA synchronizes statutory tax and audit deadlines nationwide, running automatic countdowns, recurring schedules, and team assignments.',
    highlights: [
      'GST returns tracking (GSTR-1, 3B, 9, 9C)',
      'Income Tax filing & Advance Tax payment schedules',
      'MCA & ROC annual returns & DIN e-KYC tracking',
      'TDS / TCS quarterly compliance & challan verification',
    ],
  },
  {
    id: 'messaging',
    title: 'Omnichannel Client Communication',
    badge: 'Smart Messaging',
    icon: MessageCircle,
    tagline: 'Reach clients where they actually respond — instantly.',
    description:
      'Send professional, automated notifications via official WhatsApp Business API, branded Email, and SMS with dynamic client token replacement.',
    highlights: [
      'Official WhatsApp Business integration with 1-click delivery',
      'Dynamic token personalization (client name, due date, firm letterhead)',
      'Delivery receipts & digital client acknowledgement logging',
      'Scheduled countdowns with customizable "Days Before Due" triggers',
    ],
  },
  {
    id: 'clients',
    title: '360° Client & Service Master',
    badge: 'Practice CRM',
    icon: Users,
    tagline: 'Unified client database tailored to professional accounting.',
    description:
      'Consolidate client entities (Proprietorships, Partnerships, Pvt Ltd, LLPs, Trusts) with their active service portfolios, contacts, and secure attachments.',
    highlights: [
      'Entity-specific tracking (PAN, GSTIN, TAN, CIN)',
      'Multi-service tagging (GST, ITR, Statutory Audit, Accounting)',
      'Internal private notes visible only to firm personnel',
      'Secure document vault for client PAN, certificates, and returns',
    ],
  },
  {
    id: 'orchestration',
    title: 'Firm Governance & Team Productivity',
    badge: 'Workload Orchestration',
    icon: BarChart3,
    tagline: 'Total visibility across partners, managers, and article clerks.',
    description:
      'Distribute assignments, track overdue versus upcoming items in real time, and eliminate stressful spreadsheet follow-ups.',
    highlights: [
      'Role-based access control (Partners, Staff, Article Assistants)',
      'Overdue, Due Today, and Upcoming task dashboards',
      'Automated internal staff alerts prior to client deadlines',
      'Comprehensive audit trail for every notification dispatched',
    ],
  },
];

const POLICIES_DATA = [
  {
    id: 'terms',
    title: 'Terms of Service',
    badge: 'Binding Agreement',
    summary:
      'Governs access and usage of RemindCA, an enterprise practice automation platform provided by ICEAPPLE SOFT PVT LTD for Chartered Accountants and tax consultants.',
    points: [
      'Firms affirm valid professional standing and regulatory compliance with applicable accounting and tax standards.',
      'Firms are responsible for credential security of partners, managers, and article assistants.',
      'Messaging capabilities (WhatsApp, SMS, Email) are restricted to lawful compliance, tax deadlines, and client communication.',
      'ICEAPPLE SOFT PVT LTD provides high-availability hosting with 99.9% targeted platform availability.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Data Protection',
    badge: 'DPDP Act 2023 Compliant',
    summary:
      'Strict commitment to protecting sensitive client financial data, PAN numbers, GSTIN records, and firm communication histories.',
    points: [
      'Zero commercial monetizing: Client tax records and contact databases are never sold or shared with advertisers.',
      'Bank-grade 256-bit AES encryption at rest and TLS 1.3 encryption in transit for all communications.',
      'All data resides on ISO 27001 and SOC 2 certified cloud infrastructure located in India data centers.',
      'Role-based access permissions ensure article assistants only view authorized client records.',
    ],
  },
  {
    id: 'refund',
    title: 'Cancellation & Refund Policy',
    badge: 'Fair Billing',
    summary:
      'Clear, transparent subscription policies designed for CA practices with flexible monthly and annual billing cycles.',
    points: [
      'Free 14-day trial available without upfront credit card requirements.',
      'Subscriptions may be cancelled anytime through the Billing & Subscription portal before the next renewal.',
      'Prorated refunds are honored within 7 days of annual billing if dissatisfied with core services.',
      'Data export: Firms can download a complete CSV/JSON archive of all client lists upon account cancellation.',
    ],
  },
  {
    id: 'security',
    title: 'ICAI & Regulatory Standards',
    badge: 'Professional Standing',
    summary:
      'Engineered in alignment with professional confidentiality norms prescribed by the Institute of Chartered Accountants of India (ICAI).',
    points: [
      'Client confidentiality is preserved with end-to-end access audit trails.',
      'WhatsApp templates are pre-approved and strictly adhere to non-solicitation guidelines.',
      'Multi-factor authentication (MFA) protects administrative firm operations.',
      'Daily automated encrypted backups with geo-redundant disaster recovery.',
    ],
  },
];

const FAQS_DATA = [
  {
    q: 'How does RemindCA send WhatsApp messages to our firm’s clients?',
    a: 'RemindCA integrates with the official Meta WhatsApp Business API. Messages are sent through authenticated business templates containing your firm name, dynamic client tokens (client name, return type, due date), and optional payment or document links. Clients receive messages directly in their personal WhatsApp.',
  },
  {
    q: 'Can my article assistants and branch staff use RemindCA?',
    a: 'Yes! RemindCA features granular Role-Based Access Control. You can add Partners, Managers, and Article Assistants with specific permissions so team members only view and manage clients assigned to them.',
  },
  {
    q: 'What statutory compliance tasks are pre-configured?',
    a: 'RemindCA comes pre-loaded with comprehensive Indian compliance rules: GSTR-1, GSTR-3B, GSTR-9, GSTR-9C, Advance Tax installments, ITR deadlines (Individual, Corporate, Audit cases), TDS/TCS quarterly returns, MCA annual returns (AOC-4, MGT-7), and DIN e-KYC.',
  },
  {
    q: 'Is our firm and client data secure and confidential?',
    a: 'Absolutely. We comply with the Digital Personal Data Protection (DPDP) Act 2023. All records are encrypted with 256-bit AES at rest and TLS 1.3 in transit. Client data is strictly confidential and never shared with third parties.',
  },
  {
    q: 'Can we customize the message templates and reminder schedules?',
    a: 'Yes. You have complete freedom to edit reminder text, insert dynamic variables (Firm Name, Partner Mobile, Amount, Due Date), and choose trigger schedules (e.g. 7 days before, 3 days before, 1 day before, and on the due date).',
  },
];

export default function PublicLandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activePolicyTab, setActivePolicyTab] = useState('terms');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // If user is already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return FAQS_DATA;
    const q = faqSearch.toLowerCase();
    return FAQS_DATA.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [faqSearch]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] dark:text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* ── Public Dedicated Header ── */}
      <PublicHeader />

      {/* ── Hero Section ── */}
      <section
        id="hero"
        className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-[var(--border)]"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[var(--primary)]/10 dark:bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-xs font-black text-txt-main">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-hover)] dark:text-[var(--accent)]" />
              <span>India’s #1 CA Compliance &amp; WhatsApp Reminder System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--heading)] leading-[1.15]">
              Automate Deadlines. <br />
              <span className="text-[var(--primary)] dark:text-[var(--accent)]">
                Delight Clients on WhatsApp.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-txt-sub leading-relaxed max-w-2xl mx-auto">
              Never chase clients with manual phone calls again. RemindCA automatically schedules and delivers GST, Income Tax, and ROC reminders via WhatsApp Business, SMS, and Email.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-7 text-sm font-black text-white shadow-md hover:bg-navy-hover transition-all cursor-pointer"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              </Link>
              <a
                href="#talk-with-agent"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 text-sm font-bold text-txt-main hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
              >
                <Headphones className="h-4 w-4 text-[var(--primary)] dark:text-[var(--accent)]" />
                <span>Talk to Practice Agent</span>
              </a>
            </div>

            {/* Trust badge icons */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-txt-sub font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2-minute firm setup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> ICAI ethics aligned
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center shadow-xs"
              >
                <p className="text-2xl sm:text-3xl font-black text-[var(--primary)] dark:text-[var(--accent)]">
                  {s.value}
                </p>
                <p className="mt-1 text-sm font-bold text-txt-main">{s.label}</p>
                <p className="mt-0.5 text-xs text-txt-sub">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 1: ABOUT APP
         ───────────────────────────────────────────── */}
      <section
        id="about-app"
        className="py-16 sm:py-24 border-b border-[var(--border)] scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] px-3 py-1 text-xs font-bold text-txt-sub">
              <Info className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>About RemindCA</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--heading)]">
              Engineered Exclusively for CA &amp; Tax Practices
            </h2>
            <p className="text-sm sm:text-base text-txt-sub">
              Designed by accounting technologists to eliminate manual follow-up stress, improve fee collection, and maintain pristine compliance audit trails.
            </p>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {CORE_PILLARS.map((pillar) => {
              const PIcon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-subtle)] text-[var(--primary)] dark:text-[var(--accent)] border border-[var(--border)]">
                        <PIcon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 px-3 py-1 text-xs font-bold text-txt-main">
                        {pillar.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-txt-main tracking-tight">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-[var(--accent-hover)] dark:text-[var(--accent)]">
                        {pillar.tagline}
                      </p>
                      <p className="mt-2 text-sm text-txt-sub leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2 border-t border-[var(--border)]/70 pt-4 text-xs sm:text-sm text-txt-main font-medium">
                    {pillar.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Security Standards Strip */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-subtle)] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-base font-extrabold text-txt-main">
                    Bank-Grade Security &amp; Data Sovereignty
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-txt-sub">
                  Encrypted with 256-bit AES at rest. Indian data residency with DPDP Act 2023 compliance.
                </p>
              </div>
              <Link
                href="/signup"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 text-xs font-bold text-white shadow-xs hover:bg-navy-hover shrink-0"
              >
                <span>Activate Firm Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 2: POLICIES
         ───────────────────────────────────────────── */}
      <section
        id="policies"
        className="py-16 sm:py-24 border-b border-[var(--border)] scroll-mt-20 bg-[var(--surface)]/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] px-3 py-1 text-xs font-bold text-txt-sub">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Governance &amp; Trust</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--heading)]">
              Clear, Transparent Practice Policies
            </h2>
            <p className="text-sm sm:text-base text-txt-sub">
              Read our binding terms of service, privacy safeguards, and subscription policies governing RemindCA enterprise software.
            </p>
          </div>

          {/* Policy Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {POLICIES_DATA.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePolicyTab(p.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activePolicyTab === p.id
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-[var(--surface)] border border-[var(--border)] text-txt-sub hover:text-txt-main hover:bg-[var(--surface-subtle)]'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Active Policy Card */}
          {(() => {
            const current =
              POLICIES_DATA.find((p) => p.id === activePolicyTab) || POLICIES_DATA[0];
            return (
              <div className="max-w-4xl mx-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-9 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-txt-main">
                      {current.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-txt-sub mt-1">
                      {current.summary}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                    {current.badge}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-txt-sub">
                    Key Provisions &amp; Clauses
                  </h4>
                  <ul className="space-y-3 text-xs sm:text-sm text-txt-main leading-relaxed">
                    {current.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-xl bg-[var(--surface-subtle)] p-3.5 border border-[var(--border)]/70">
                        <CheckCircle2 className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-txt-sub">
                  <span>Version 2.4 · Effective 2025</span>
                  <span>Governed under Laws of India</span>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 3: TALK WITH AGENT
         ───────────────────────────────────────────── */}
      <section
        id="talk-with-agent"
        className="py-16 sm:py-24 border-b border-[var(--border)] scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] px-3 py-1 text-xs font-bold text-txt-sub">
              <Headphones className="h-3.5 w-3.5 text-[var(--primary)] dark:text-[var(--accent)]" />
              <span>Direct Practice Assistance</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--heading)]">
              Talk With Our Practice Agent
            </h2>
            <p className="text-sm sm:text-base text-txt-sub">
              Need personalized guidance on setting up your firm, integrating WhatsApp Business API, or training article assistants? Our dedicated team is here to assist.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Phone Card */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-txt-sub uppercase tracking-wider">
                  Direct Phone Support
                </p>
                <p className="text-xl sm:text-2xl font-black font-mono text-txt-main">
                  +91 8866189222
                </p>
                <p className="text-xs text-txt-sub">
                  Mon – Sat, 9:30 AM – 7:00 PM IST
                </p>
              </div>
              <a
                href="tel:+918866189222"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white hover:bg-navy-hover transition-colors shadow-xs"
                title="Call Agent"
                aria-label="Call Agent"
              >
                <Phone className="h-5 w-5 text-[var(--accent)]" />
              </a>
            </div>

            {/* Email Card */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-txt-sub uppercase tracking-wider">
                  Email Support Desk
                </p>
                <p className="text-lg sm:text-xl font-bold font-mono text-txt-main">
                  support@remindca.com
                </p>
                <p className="text-xs text-txt-sub">
                  Guaranteed response within 4 hours
                </p>
              </div>
              <a
                href="mailto:support@remindca.com"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white hover:bg-navy-hover transition-colors shadow-xs"
                title="Email Agent"
                aria-label="Email Agent"
              >
                <Mail className="h-5 w-5 text-[var(--accent)]" />
              </a>
            </div>
          </div>

          {/* Agent Service Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Building2,
                title: 'Firm Onboarding',
                text: 'Assistance setting up custom GST, ITR, and ROC reminder workflows.',
              },
              {
                icon: MessageCircle,
                title: 'WhatsApp Setup',
                text: 'Official Meta WhatsApp Business API activation and green tick guidance.',
              },
              {
                icon: Layers,
                title: 'Data Migration',
                text: 'Bulk import your client rosters from Tally, Excel, or existing software.',
              },
              {
                icon: TrendingUp,
                title: 'Practice Scaling',
                text: 'Maximize client retention and on-time compliance collection.',
              },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5 space-y-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--primary)] dark:text-[var(--accent)] border border-[var(--border)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold text-txt-main">{p.title}</h4>
                  <p className="text-xs text-txt-sub leading-relaxed">{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 4: HELP & SUPPORT
         ───────────────────────────────────────────── */}
      <section
        id="help-and-support"
        className="py-16 sm:py-24 border-b border-[var(--border)] scroll-mt-20 bg-[var(--surface)]/50"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] px-3 py-1 text-xs font-bold text-txt-sub">
              <HelpCircle className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>Knowledge Base &amp; FAQ</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--heading)]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-txt-sub">
              Everything you need to know about getting started, automating reminders, and managing your CA practice.
            </p>
          </div>

          {/* FAQ Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-txt-sub" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search compliance, WhatsApp, setup questions..."
              className="w-full h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm font-medium text-txt-main placeholder:text-txt-sub/50 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 dark:focus:border-[var(--accent)] shadow-xs transition-all"
            />
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--surface-subtle)]/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-txt-main">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-txt-sub shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[var(--primary)] dark:text-[var(--accent)]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-txt-sub leading-relaxed border-t border-[var(--border)]/60 bg-[var(--surface-subtle)]/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center text-sm text-txt-sub italic">
                No matching questions found for &quot;{faqSearch}&quot;. Try a different search term or talk to our agent.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Public Footer ── */}
      <footer className="bg-[var(--surface)] py-12 border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[var(--border)]">
            <div className="text-center md:text-left space-y-1">
              <p className="text-lg font-black text-txt-main">RemindCA</p>
              <p className="text-xs text-txt-sub">
                Enterprise practice automation software for Chartered Accountants &amp; Tax Consultants.
              </p>
            </div>

            {/* Anchor quick jumps */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-txt-sub">
              <a href="#about-app" className="hover:text-txt-main transition-colors">
                About App
              </a>
              <span>·</span>
              <a href="#policies" className="hover:text-txt-main transition-colors">
                Policies
              </a>
              <span>·</span>
              <a href="#talk-with-agent" className="hover:text-txt-main transition-colors">
                Talk With Agent
              </a>
              <span>·</span>
              <a href="#help-and-support" className="hover:text-txt-main transition-colors">
                Help &amp; Support
              </a>
              <span>·</span>
              <Link href="/login" className="hover:text-txt-main transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-txt-sub">
            <p>&copy; {new Date().getFullYear()} ICEAPPLE SOFT PVT LTD. All rights reserved.</p>
            <p>Made with pride for India’s accounting &amp; finance community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
