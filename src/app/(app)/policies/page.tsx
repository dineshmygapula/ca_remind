"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  LockKeyhole,
  Cookie,
  Printer,
  Copy,
  Check,
  Search,
  ChevronRight,
  ExternalLink,
  Building2,
  Calendar,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

interface PolicySection {
  id: string;
  title: string;
  content: string[];
}

interface PolicyDocument {
  id: string;
  title: string;
  shortTitle: string;
  badge: string;
  icon: typeof ShieldCheck;
  lastUpdated: string;
  version: string;
  summary: string;
  callout?: {
    title: string;
    description: string;
  };
  sections: PolicySection[];
}

const POLICY_DOCUMENTS: PolicyDocument[] = [
  {
    id: "terms",
    title: "Terms and Conditions of Service",
    shortTitle: "Terms of Service",
    badge: "Binding Agreement",
    icon: FileText,
    lastUpdated: "January 15, 2025",
    version: "v2.4",
    summary:
      "These Terms of Service govern your access to and use of RemindCA, an enterprise practice automation software provided by ICEAPPLE SOFT PVT LTD for Chartered Accountants and tax consultants.",
    callout: {
      title: "Notice for Professional Accounting Practices",
      description:
        "By subscribing to or accessing RemindCA, you affirm that your firm holds valid professional standing and that all client records uploaded comply with applicable regulatory bodies (including ICAI guidelines and national tax laws).",
    },
    sections: [
      {
        id: "terms-acceptance",
        title: "1. Acceptance of Terms",
        content: [
          "By creating an account, accessing, or subscribing to RemindCA (the 'Service'), you ('Subscriber', 'Firm', or 'User') agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a partnership, firm, or company, you represent that you possess the full legal authority to bind such entity.",
          "If you do not agree with any part of these terms, you must not access the platform or must immediately terminate your workspace subscription.",
        ],
      },
      {
        id: "terms-account",
        title: "2. Firm Accounts and User Responsibilities",
        content: [
          "Firms are responsible for safeguarding login credentials of all registered partners, staff members, and article clerks. RemindCA employs multi-factor authentication and session management to assist with security.",
          "You agree to notify RemindCA support immediately upon suspecting any unauthorized access, compromised credentials, or security incidents within your workspace.",
          "Each firm must ensure that data uploaded regarding third-party clients (including PAN, GSTIN, and contact information) has been lawfully collected in accordance with the Indian Digital Personal Data Protection Act, 2023.",
        ],
      },
      {
        id: "terms-use",
        title: "3. Acceptable Use and Messaging Policies",
        content: [
          "The Service provides automated notifications through WhatsApp Business API, SMS gateways, and email dispatch solely for lawful compliance, tax deadlines, document requests, and accounting reminders.",
          "Firms are strictly prohibited from utilizing RemindCA for bulk unsolicited marketing, spam, unlawful solicitation, or transmitting harmful or fraudulent material.",
          "Violation of messaging conduct policies may result in immediate suspension of third-party delivery channels (e.g., WhatsApp number disconnection) by Meta or telecom regulators without liability to ICEAPPLE SOFT PVT LTD.",
        ],
      },
      {
        id: "terms-ip",
        title: "4. Intellectual Property and Proprietary Rights",
        content: [
          "All software code, visual design, database structures, algorithms, logos, and trademarks associated with RemindCA are the exclusive intellectual property of ICEAPPLE SOFT PVT LTD.",
          "Firms retain 100% ownership of their uploaded client rosters, confidential tax documents, custom templates, and internal task schedules.",
        ],
      },
      {
        id: "terms-liability",
        title: "5. Limitation of Liability and Professional Advice Disclaimer",
        content: [
          "RemindCA is a workflow tracking and communication tool. It does NOT constitute legal, financial, or statutory tax advice. The ultimate responsibility for meeting statutory tax deadlines and verifying computational accuracy rests exclusively with the practicing Chartered Accountant or tax professional.",
          "To the maximum extent permitted by Indian law, ICEAPPLE SOFT PVT LTD shall not be liable for any indirect, incidental, or punitive damages resulting from network delivery outages, carrier SMS drops, or third-party telecom delays.",
        ],
      },
      {
        id: "terms-governing",
        title: "6. Governing Law and Dispute Resolution",
        content: [
          "These Terms are governed by and construed in accordance with the substantive laws of the Republic of India. Any legal dispute, controversy, or claim arising out of this agreement shall be subject to the exclusive jurisdiction of the competent courts in India.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    shortTitle: "Privacy Policy",
    badge: "Data Privacy",
    icon: ShieldAlert,
    lastUpdated: "January 15, 2025",
    version: "v2.4",
    summary:
      "This Privacy Policy describes how RemindCA collects, utilizes, stores, and protects personal and commercial data across firm workspaces, client records, and automated messaging endpoints.",
    callout: {
      title: "Our Core Privacy Commitment",
      description:
        "RemindCA NEVER sells, monetizes, or shares client financial information, tax return data, or contact lists with advertisers or third-party data brokers.",
    },
    sections: [
      {
        id: "privacy-collection",
        title: "1. Information We Collect",
        content: [
          "Firm Account Data: Firm name, registered email address, owner mobile number, billing details, and staff profiles created by administrators.",
          "Client Records: Name, phone number, email address, entity type, GSTIN, PAN, and specific compliance service assignments entered into the firm's workspace.",
          "Operational Logs: Timestamped dispatch logs, delivery statuses (Sent, Delivered, Read, Acknowledged), system usage analytics, and authentication tokens.",
        ],
      },
      {
        id: "privacy-use",
        title: "2. How We Use Collected Information",
        content: [
          "To deliver the primary software functionality: orchestrating compliance deadlines, dispatching automated WhatsApp/SMS/Email notifications, and maintaining client profiles.",
          "To authenticate users, safeguard against unauthorized workspace access, and maintain secure session state.",
          "To communicate service announcements, invoice notices, and critical statutory calendar updates.",
        ],
      },
      {
        id: "privacy-sharing",
        title: "3. Third-Party Service Providers",
        content: [
          "We interface only with enterprise-grade sub-processors necessary for core service delivery: Meta Cloud WhatsApp API for WhatsApp messaging, verified telecom SMS gateways, and secure cloud storage infrastructure.",
          "All sub-processors are bound by strict confidentiality and data protection agreements consistent with industry standards.",
        ],
      },
      {
        id: "privacy-retention",
        title: "4. Data Retention and Deletion",
        content: [
          "Workspace data is preserved throughout the duration of your active subscription. In the event of subscription cancellation, firms may request a complete export of their client data within 60 days.",
          "Upon formal request, all firm databases, reminder history, and uploaded attachments are securely purged from our primary servers in accordance with data erasure protocols.",
        ],
      },
      {
        id: "privacy-dpdp",
        title: "5. Compliance with DPDP Act 2023",
        content: [
          "In alignment with the Digital Personal Data Protection Act, 2023 of India, individuals possess rights of access, correction, and erasure. Firms serve as Data Fiduciaries regarding their individual clients, and RemindCA acts as a Data Processor executing lawful processing instructions.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Data Protection & Security Policy",
    shortTitle: "Data Protection",
    badge: "Enterprise Security",
    icon: LockKeyhole,
    lastUpdated: "January 15, 2025",
    version: "v2.2",
    summary:
      "A comprehensive technical overview of the encryption algorithms, architectural controls, and physical safeguards implemented to protect your practice's confidential files and tax records.",
    callout: {
      title: "Bank-Grade Cryptography",
      description:
        "All data at rest is encrypted with AES-256 cipher keys. All network transmissions are strictly enforced over TLS 1.3 with HSTS enabled.",
    },
    sections: [
      {
        id: "sec-encryption",
        title: "1. Cryptographic Safeguards",
        content: [
          "Encryption in Transit: All incoming and outgoing network traffic uses Transport Layer Security (TLS 1.3) with modern cipher suites. Insecure HTTP connections are automatically redirected.",
          "Encryption at Rest: Firm databases, client lists, and uploaded document attachments are stored using AES-256 bit encryption keys managed in enterprise hardware security modules.",
        ],
      },
      {
        id: "sec-isolation",
        title: "2. Multi-Tenant Architectural Isolation",
        content: [
          "RemindCA employs strict logical tenant partitioning. Software queries and API endpoints are cryptographically scoped to the authenticated organization's unique identifier.",
          "Staff members of one CA firm cannot access, query, or view records belonging to any other firm under any circumstances.",
        ],
      },
      {
        id: "sec-access",
        title: "3. Role-Based Access Control (RBAC)",
        content: [
          "Administrators can configure granular permissions across Partners, Senior Managers, Staff Accountants, and Article Assistants.",
          "Access logs track critical operations, including client deletion, export requests, and reminder dispatch alterations.",
        ],
      },
      {
        id: "sec-backup",
        title: "4. Disaster Recovery and Backups",
        content: [
          "Automated point-in-time database snapshots are taken continuously and replicated across redundant cloud availability zones.",
          "Disaster recovery runbooks are tested regularly to ensure a Recovery Point Objective (RPO) of < 15 minutes and a Recovery Time Objective (RTO) of < 2 hours.",
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookie and Tracking Policy",
    shortTitle: "Cookie Policy",
    badge: "User Preferences",
    icon: Cookie,
    lastUpdated: "January 15, 2025",
    version: "v1.8",
    summary:
      "Explains the usage of cookies, local storage, and session tokens utilized by RemindCA to ensure reliable authentication and remember your interface preferences.",
    sections: [
      {
        id: "cookie-types",
        title: "1. Categories of Cookies We Use",
        content: [
          "Strictly Necessary Session Tokens: Essential for secure user authentication (Firebase Auth), CSRF protection, and keeping your firm workspace session active.",
          "Preference Storage: Stores UI configurations such as dark/light mode preference, sidebar collapse status, and table page-size preferences.",
          "Performance & Error Telemetry: Anonymized diagnostic tokens used to monitor client-side load performance and catch JavaScript runtime errors.",
        ],
      },
      {
        id: "cookie-third",
        title: "2. No Third-Party Tracking Advertisers",
        content: [
          "RemindCA does NOT deploy third-party advertising cookies, retargeting pixels (e.g., Facebook Pixel), or behavioral surveillance trackers inside your logged-in portal.",
        ],
      },
      {
        id: "cookie-manage",
        title: "3. How You Can Manage Cookies",
        content: [
          "You can modify your browser settings to decline or clear cookies. However, disabling essential session tokens will prevent you from logging in and navigating the secure portal.",
        ],
      },
    ],
  },
  {
    id: "refund",
    title: "Subscription, Billing & Refund Policy",
    shortTitle: "Refund Policy",
    badge: "Billing Terms",
    icon: RefreshCcw,
    lastUpdated: "January 15, 2025",
    version: "v2.0",
    summary:
      "Details billing cycles, renewal protocols, upgrade adjustments, and refund eligibility criteria for RemindCA firm subscriptions.",
    sections: [
      {
        id: "refund-billing",
        title: "1. Billing Frequency & Taxes",
        content: [
          "Subscription fees are billed in advance on either a Monthly or Annual cycle as selected by the Firm during checkout.",
          "All stated subscription rates are subject to applicable Goods and Services Tax (GST) in India. Valid GST invoices with input tax credit details are generated automatically.",
        ],
      },
      {
        id: "refund-cancellation",
        title: "2. Cancellation Protocol",
        content: [
          "Firms may cancel their recurring subscription at any time directly through Settings → Subscription & Billing. Upon cancellation, your workspace retains full access until the conclusion of the current prepaid billing period.",
        ],
      },
      {
        id: "refund-terms",
        title: "3. 7-Day Satisfaction Guarantee",
        content: [
          "First-time annual plan subscribers are eligible for a full refund within seven (7) calendar days of initial subscription purchase if the software fails to meet your firm's operational requirements.",
          "Refund requests must be formally initiated via email to support@remindca.com from the primary administrator's registered email address.",
        ],
      },
    ],
  },
  {
    id: "sla",
    title: "Service Level Agreement (SLA)",
    shortTitle: "Service SLA",
    badge: "Availability Target",
    icon: FileCheck2,
    lastUpdated: "January 15, 2025",
    version: "v2.1",
    summary:
      "Specifies our uptime commitment, scheduled maintenance procedures, and emergency response targets for mission-critical tax compliance deadlines.",
    sections: [
      {
        id: "sla-uptime",
        title: "1. 99.9% Uptime Commitment",
        content: [
          "RemindCA guarantees an operational uptime commitment of at least 99.9% across every calendar month, excluding scheduled maintenance windows.",
          "System health metrics, delivery queues, and gateway states are monitored 24/7 by our site reliability engineering team.",
        ],
      },
      {
        id: "sla-maintenance",
        title: "2. Scheduled Maintenance Windows",
        content: [
          "Routine infrastructure updates and database optimizations are conducted during low-volume hours (typically Sundays between 01:00 AM and 04:00 AM IST).",
          "Advanced notification of at least 48 hours is posted within the application header for any planned downtime exceeding 15 minutes.",
        ],
      },
      {
        id: "sla-response",
        title: "3. Incident Severity and Response Targets",
        content: [
          "Severity 1 (Critical Platform Outage): Initial response within 30 minutes; dedicated continuous remediation.",
          "Severity 2 (Messaging Gateway Degraded): Initial response within 2 hours; secondary route failover.",
          "Severity 3 (General Inquiries & Routine Bug Reports): Response within 4 business hours.",
        ],
      },
    ],
  },
];

export default function PoliciesLegalPage() {
  const [activeDocId, setActiveDocId] = useState<string>("terms");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const activeDoc = useMemo(() => {
    return (
      POLICY_DOCUMENTS.find((doc) => doc.id === activeDocId) ||
      POLICY_DOCUMENTS[0]
    );
  }, [activeDocId]);

  // Filter sections if search query is entered
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeDoc.sections;

    return activeDoc.sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.content.some((c) => c.toLowerCase().includes(q))
    );
  }, [activeDoc, searchQuery]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-16 pt-6 text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">

          {/* Breadcrumb & Top Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Link href="/dashboard" className="transition-colors hover:text-[var(--primary)]">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-[var(--text-primary)]">Policies & Legal Hub</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                Jurisdiction: Republic of India
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                Effective: Jan 2025
              </span>
            </div>
          </div>

          {/* Page Header */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)]/10 px-3 py-1 text-xs font-bold text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                  <ShieldCheck className="h-4 w-4" />
                  Legal, Governance & Compliance Hub
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[var(--heading)] sm:text-4xl">
                  Policies & Legal Terms
                </h1>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                  Complete transparency for Chartered Accountants. Review our professional terms of service, strict taxpayer data privacy safeguards, DPDP compliance standards, and SLA guarantees.
                </p>
              </div>

              {/* Quick stats on legal compliance */}
              <div className="flex shrink-0 gap-3 sm:gap-4 overflow-x-auto pb-2 lg:pb-0">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 p-4 text-center min-w-[110px]">
                  <div className="text-xl font-black text-[var(--primary)] dark:text-[var(--accent)]">
                    {POLICY_DOCUMENTS.length}
                  </div>
                  <div className="mt-1 text-[11px] font-bold uppercase text-[var(--heading)]">
                    Legal Acts
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 p-4 text-center min-w-[110px]">
                  <div className="text-xl font-black text-[var(--primary)] dark:text-[var(--accent)]">
                    256-Bit
                  </div>
                  <div className="mt-1 text-[11px] font-bold uppercase text-[var(--heading)]">
                    AES Storage
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 p-4 text-center min-w-[110px]">
                  <div className="text-xl font-black text-[var(--primary)] dark:text-[var(--accent)]">
                    DPDP
                  </div>
                  <div className="mt-1 text-[11px] font-bold uppercase text-[var(--heading)]">
                    Compliant
                  </div>
                </div>
              </div>
            </div>

            {/* Document Navigation Tabs */}
            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <div className="flex flex-wrap gap-2">
                {POLICY_DOCUMENTS.map((doc) => {
                  const Icon = doc.icon;
                  const isActive = activeDocId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setActiveDocId(doc.id);
                        setSearchQuery("");
                      }}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[var(--primary)] text-white shadow-md dark:bg-[var(--accent)] dark:text-[#0b1220]"
                          : "border border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--heading)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{doc.shortTitle}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] ${
                          isActive
                            ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0b1220]"
                            : "bg-[var(--border)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {doc.version}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Legal Document Reader Layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">

            {/* Left Column: Sticky Table of Contents & Quick Search (Desktop) */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Search Inside Document */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--heading)] mb-2.5">
                  Search This Document
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter sections..."
                    className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] pl-9 pr-3 text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-[11px] font-semibold text-[var(--accent)] hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Table of Contents */}
              <div className="sticky top-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--heading)]">
                  Table of Contents
                </div>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                  Jump directly to any section
                </p>

                <div className="mt-4 space-y-1">
                  {activeDoc.sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className="group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--primary)]"
                    >
                      <span className="truncate">{section.title}</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>

                {/* Quick Document Actions */}
                <div className="mt-6 border-t border-[var(--border)] pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2 text-xs font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--primary)]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        <span>Copy Page Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2 text-xs font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--primary)]"
                  >
                    <Printer className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    <span>Print Document</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Right Column: Full Legal Content */}
            <div className="space-y-6 lg:col-span-3">

              {/* Document Overview Header */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-bold text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                      {activeDoc.badge}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      Version {activeDoc.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Last Revised: {activeDoc.lastUpdated}</span>
                  </div>
                </div>

                <h2 className="mt-4 text-2xl font-extrabold text-[var(--heading)] sm:text-3xl">
                  {activeDoc.title}
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {activeDoc.summary}
                </p>

                {/* Important Callout Box */}
                {activeDoc.callout && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-[var(--heading)] dark:bg-[var(--accent)]/15">
                    <AlertCircle className="h-5 w-5 shrink-0 text-[var(--accent)] mt-0.5" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                        {activeDoc.callout.title}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--text-primary)]">
                        {activeDoc.callout.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rendered Legal Sections */}
              {filteredSections.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">
                    No matching clauses found for &quot;{searchQuery}&quot;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-xs font-bold text-[var(--primary)] hover:underline"
                  >
                    View all sections
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredSections.map((section) => (
                    <div
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm"
                    >
                      <h3 className="text-lg font-bold text-[var(--heading)] sm:text-xl">
                        {section.title}
                      </h3>

                      <div className="mt-4 space-y-3">
                        {section.content.map((paragraph, pIdx) => (
                          <p
                            key={pIdx}
                            className="text-sm leading-relaxed text-[var(--text-secondary)]"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Statutory Grievance Redressal Card */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--heading)]">
                      Statutory Grievance Redressal Officer
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      In compliance with the Information Technology Act, 2000 & DPDP Act, 2023
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/70 p-4 text-xs">
                  <div>
                    <span className="font-bold text-[var(--heading)]">Designation:</span>
                    <p className="mt-0.5 text-[var(--text-secondary)]">Grievance & Privacy Officer</p>
                  </div>
                  <div>
                    <span className="font-bold text-[var(--heading)]">Corporate Entity:</span>
                    <p className="mt-0.5 text-[var(--text-secondary)]">ICEAPPLE SOFT PVT LTD</p>
                  </div>
                  <div>
                    <span className="font-bold text-[var(--heading)]">Email Address:</span>
                    <p className="mt-0.5">
                      <a href="mailto:grievance@remindca.com" className="font-semibold text-[var(--primary)] hover:underline dark:text-[var(--accent)]">
                        grievance@remindca.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-[var(--heading)]">Resolution Turnaround:</span>
                    <p className="mt-0.5 text-[var(--text-secondary)]">Within 15 business days</p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--text-secondary)] px-2">
                <span>© {new Date().getFullYear()} ICEAPPLE SOFT PVT LTD. All Rights Reserved.</span>
                <div className="flex items-center gap-4">
                  <Link href="/aboutapp" className="hover:text-[var(--primary)] hover:underline">
                    About App
                  </Link>
                  <Link href="/help&support" className="hover:text-[var(--primary)] hover:underline">
                    Help & Support
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}