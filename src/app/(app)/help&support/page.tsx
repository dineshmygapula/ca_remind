"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Drawer from "@/components/common/Drawer";
import {
  Rocket,
  Info,
  Building2,
  Bell,
  Paperclip,
  MessageCircle,
  CreditCard,
  Lock,
  Wrench,
  CircleHelp,
  Search,
  ChevronDown,
  Users,
  SmilePlus,
  Clock,
  ListFilter,
  FilePlus2,
  UserMinus,
  CalendarDays,
  Repeat,
  BellOff,
  ListChecks,
  Sparkles,
  MessageSquare,
  Star,
  WalletCards,
  ShieldCheck,
  Gauge,
  Headphones,
  LayoutDashboard,
  KeyRound,
  ArrowRight,
  Phone,
  Mail,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Send,
  Ticket,
  ExternalLink,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface FAQItem {
  id: string;
  icon: typeof Rocket;
  question: string;
  answer: string;
  steps?: string[];
  shortcut?: {
    label: string;
    href: string;
  };
}

interface Category {
  id: string;
  title: string;
  icon: typeof Rocket;
  badge: string;
  questions: FAQItem[];
}

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    badge: "Setup & Onboarding",
    questions: [
      {
        id: "gs-1",
        icon: Rocket,
        question: "How do I create and configure my first CA firm workspace?",
        answer:
          "Setting up your firm workspace takes less than 2 minutes. Fill in your firm credentials, contact numbers, and optional GSTIN to activate your professional compliance dashboard.",
        steps: [
          "Log in to RemindCA using your registered administrator credentials.",
          "Navigate to Settings → Business Profile or click 'Setup Firm'.",
          "Enter your Firm Name, Principal Partner Mobile Number, and Firm Office Address.",
          "Add your firm's GSTIN and upload your firm logo for branded client messages.",
          "Save changes. Your workspace is immediately active and ready for client creation.",
        ],
        shortcut: { label: "Go to Business Profile", href: "/business-profile" },
      },
      {
        id: "gs-2",
        icon: Info,
        question: "What information is mandatory to create my firm profile?",
        answer:
          "The mandatory fields required for firm creation are: Firm/Business Name, Principal Owner Name, Contact Mobile Number, and Firm Type (Proprietorship, Partnership, or LLP). Optional fields such as GSTIN, letterhead logo, and secondary office address can be updated anytime.",
      },
      {
        id: "gs-3",
        icon: LayoutDashboard,
        question:
          "What do the numbers on the Dashboard (Overdue, Today, Upcoming) signify?",
        answer:
          "These real-time operational indicators help you triage compliance deadlines across all registered clients:",
        steps: [
          "Overdue: Tasks whose statutory or firm-assigned due dates have lapsed without completion. Requires urgent partner follow-up.",
          "Today: Compliance items scheduled specifically for today's date.",
          "Upcoming: Future compliance deadlines scheduled across the upcoming 7 calendar days.",
        ],
        shortcut: { label: "View Dashboard", href: "/dashboard" },
      },
      {
        id: "gs-4",
        icon: KeyRound,
        question: "How do I reset my password if I am unable to log in?",
        answer:
          "On the login screen, click 'Forgot Password' and enter your registered email. A secure, time-sensitive password reset link will be sent to your inbox within 2 minutes. If it does not appear in your primary inbox, please inspect your spam or junk folder.",
      },
    ],
  },
  {
    id: "client-management",
    title: "Client Management",
    icon: Users,
    badge: "CRM & Masters",
    questions: [
      {
        id: "cm-1",
        icon: SmilePlus,
        question:
          "How do I add a new client and specify their statutory services (GST, ITR, ROC)?",
        answer:
          "RemindCA allows multi-service assignment per client entity to streamline compliance tracking.",
        steps: [
          "Go to the Clients section from the main navigation menu.",
          "Click the '+ Add Client' button in the upper right corner.",
          "Enter the Client Name, Entity Type, Phone Number (WhatsApp preferred), and Email.",
          "Select the applicable service types (e.g. GST, ITR, ROC, TDS, Audits).",
          "Click Save. The client is now enrolled and available for automated reminders.",
        ],
        shortcut: { label: "Open Clients List", href: "/clients" },
      },
      {
        id: "cm-2",
        icon: Clock,
        question:
          "How do I view all scheduled and active reminders for a specific client?",
        answer:
          "Open the client's record by clicking their row in the Clients table. Inside their profile, switch to the 'Reminders' tab to inspect historical dispatches, scheduled future notifications, and delivery receipts.",
      },
      {
        id: "cm-3",
        icon: ListFilter,
        question: "How do I filter clients by service type or assigned staff member?",
        answer:
          "In the Clients table, click the 'Filters' button. You can filter simultaneously by Service Category (e.g., GST or ROC), Active/Archived status, or assigned Article Clerk/Staff Member.",
      },
      {
        id: "cm-4",
        icon: FilePlus2,
        question: "Can I record private internal notes regarding a client?",
        answer:
          "Yes. Inside any client profile, navigate to the Internal Notes panel. You can document confidential firm notes, special billing instructions, or past meeting summaries. These notes are visible strictly to your firm's staff and are never dispatched to the client.",
      },
    ],
  },
  {
    id: "reminder-task",
    title: "Reminder & Task Management",
    icon: Bell,
    badge: "Deadlines Engine",
    questions: [
      {
        id: "rt-1",
        icon: CalendarDays,
        question: "What are the required steps to create and schedule a compliance reminder?",
        answer:
          "Creating a reminder takes only a few clicks:",
        steps: [
          "Navigate to Reminders and click 'Create Reminder'.",
          "Select the target Client and choose the compliance task type (e.g., GSTR-3B Filing).",
          "Pick the dispatch method: 'Send Now' or 'Schedule Date & Time'.",
          "Choose delivery channels: WhatsApp, Email, or SMS.",
          "Preview the auto-generated template populated with client tokens, then click Confirm.",
        ],
        shortcut: { label: "Go to Reminders", href: "/reminders" },
      },
      {
        id: "rt-2",
        icon: Repeat,
        question: "How do I configure recurring automated reminders (Monthly, Quarterly)?",
        answer:
          "When drafting or editing a reminder, enable the 'Recurrence' toggle. You can choose Monthly (e.g., for GSTR-3B on the 18th of every month) or Quarterly (e.g., for Advance Tax or TDS). RemindCA will auto-generate subsequent reminder instances automatically.",
      },
      {
        id: "rt-3",
        icon: Bell,
        question:
          "How does the 'Days Before Due' internal notification trigger function?",
        answer:
          "The 'Days Before Due' feature sends internal alerts to your firm's staff prior to statutory cutoff dates. For example, if configured for 5 days, your assigned staff member receives a reminder 5 days before the GSTR-1 deadline to collect documents from the client.",
      },
      {
        id: "rt-4",
        icon: ListChecks,
        question: "What do the different reminder statuses mean?",
        answer:
          "Scheduled: Queued for future automated dispatch. Sent: Successfully dispatched via WhatsApp/SMS/Email gateway. Failed: Delivery failed due to incorrect phone number or network dropout. Acknowledged: The client opened or acknowledged the compliance notice.",
      },
    ],
  },
  {
    id: "templates",
    title: "Templates & WhatsApp Delivery",
    icon: MessageCircle,
    badge: "Communications",
    questions: [
      {
        id: "tpl-1",
        icon: Sparkles,
        question:
          "Where do I find pre-built statutory templates for GST, TDS, and ROC?",
        answer:
          "Go to Settings → Message Templates. RemindCA provides official, pre-drafted templates tailored to Indian tax compliances, including GSTR-1, GSTR-3B, Advance Tax, ITR Filing, and ROC Annual Filings.",
        shortcut: { label: "View Templates", href: "/templates" },
      },
      {
        id: "tpl-2",
        icon: MessageSquare,
        question: "How do I create a custom template with dynamic placeholders?",
        answer:
          "In the Message Templates module, click '+ New Template'. You can use smart replacement variables such as [CLIENT_NAME], [DUE_DATE], [TASK_NAME], and [FIRM_NAME]. During dispatch, RemindCA dynamically replaces these placeholders with actual client values.",
      },
      {
        id: "tpl-3",
        icon: MessageCircle,
        question: "How does direct WhatsApp dispatch work?",
        answer:
          "RemindCA leverages the official Meta Cloud WhatsApp Business API. When a reminder triggers, the WhatsApp message is delivered directly from your verified firm sender with interactive action buttons allowing the client to acknowledge with a single tap.",
      },
    ],
  },
  {
    id: "billing",
    title: "Subscription & Invoicing",
    icon: CreditCard,
    badge: "Plans & Billing",
    questions: [
      {
        id: "bil-1",
        icon: Star,
        question: "What features are unlocked with a RemindCA Premium Membership?",
        answer:
          "Premium membership unlocks: unlimited clients, unlimited WhatsApp & Email reminders, multi-staff access with role-based permissions, custom firm branding on notifications, priority SLA support, and complete audit trail export.",
        shortcut: { label: "View Subscription Plans", href: "/subscription" },
      },
      {
        id: "bil-2",
        icon: WalletCards,
        question: "How do I upgrade, downgrade, or download GST invoices for my subscription?",
        answer:
          "Navigate to Settings → Subscription & Billing. You can upgrade your plan or switch between Monthly and Annual billing. Download compliant tax invoices with your firm's GSTIN anytime under the Billing History tab.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & Diagnostics",
    icon: Wrench,
    badge: "Technical Support",
    questions: [
      {
        id: "tr-1",
        icon: BellOff,
        question: "Why did a client not receive their scheduled WhatsApp reminder?",
        answer:
          "Check the following standard checks:",
        steps: [
          "Verify the client's mobile number includes the correct country code (+91 for India) without extra zeroes or hyphens.",
          "Ensure the client's number has an active WhatsApp account.",
          "Check the reminder status in your Reminders audit log. If marked 'Failed', the specific error reason will be displayed.",
          "Check that your firm's monthly WhatsApp messaging quota has not been exceeded.",
        ],
      },
      {
        id: "tr-2",
        icon: Gauge,
        question: "The workspace is loading slowly or facing browser caching issues.",
        answer:
          "Perform a hard refresh (Ctrl + Shift + R on Windows, or Cmd + Shift + R on Mac). Ensure you are running a modern browser (Google Chrome, Microsoft Edge, or Firefox). Clearing cached site data typically resolves stale session tokens.",
      },
      {
        id: "tr-3",
        icon: Headphones,
        question: "How do I escalate an urgent issue during statutory filing week?",
        answer:
          "During critical tax filing cutoff days (e.g., 20th of the month for GSTR-3B, July 31st, October 31st), our priority hotline +91 8866189222 is active with dedicated standby engineers. You can also click 'Submit Support Ticket' above for sub-30 minute emergency response.",
      },
    ],
  },
];

const POPULAR_TAGS = [
  "WhatsApp Reminders",
  "GST Due Dates",
  "Recurrence Rules",
  "Password Reset",
  "Add Staff Member",
  "Custom Templates",
  "GST Invoices",
];

export default function HelpSupport() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | false>(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, "yes" | "no">>({});

  // Ticket Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({
    name: "",
    firmName: "",
    email: "",
    category: "Technical Issue",
    priority: "Normal",
    subject: "",
    description: "",
  });

  const handleAccordion = (panel: string) => {
    setExpanded((current) => (current === panel ? false : panel));
  };

  const handleVote = (faqId: string, vote: "yes" | "no") => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [faqId]: vote,
    }));
  };

  // Filter categories and questions
  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();

    return CATEGORIES.map((cat) => {
      // Check if this category matches the active category filter
      if (activeCategory !== "all" && cat.id !== activeCategory) {
        return { ...cat, questions: [] };
      }

      const matchingQuestions = cat.questions.filter((item) => {
        if (!q) return true;
        const inQuestion = item.question.toLowerCase().includes(q);
        const inAnswer = item.answer.toLowerCase().includes(q);
        const inSteps = item.steps?.some((s) => s.toLowerCase().includes(q));
        return inQuestion || inAnswer || inSteps;
      });

      return {
        ...cat,
        questions: matchingQuestions,
      };
    }).filter((cat) => cat.questions.length > 0);
  }, [search, activeCategory]);

  const totalQuestions = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);
  }, []);

  const matchingQuestionsCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.questions.length, 0);
  }, [filteredCategories]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const generatedId = `RCA-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmitting(false);
      setTicketSuccess(generatedId);
      setTicketForm({
        name: "",
        firmName: "",
        email: "",
        category: "Technical Issue",
        priority: "Normal",
        subject: "",
        description: "",
      });
    }, 1000);
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
              <span className="font-semibold text-[var(--text-primary)]">Help Desk & Support</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Support Agents Live • Mon–Sat 9 AM–6 PM IST
              </span>
            </div>
          </div>

          {/* Hero Banner with Integrated Search */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-sm">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--accent)]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3.5 py-1 text-xs font-bold text-[var(--primary)] dark:border-[var(--accent)]/30 dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                <CircleHelp className="h-4 w-4" />
                RemindCA Knowledge & Assistance Hub
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[var(--heading)] sm:text-4xl lg:text-5xl">
                How can we assist your firm today?
              </h1>

              <p className="text-sm text-[var(--text-secondary)] sm:text-base">
                Search our comprehensive guides, discover step-by-step solutions, or contact our dedicated CA support specialists.
              </p>

              {/* Main Search Input */}
              <div className="relative pt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions, WhatsApp delivery, GST setup, billing..."
                  className="h-13 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] pl-12 pr-10 text-sm font-medium text-[var(--text-primary)] shadow-sm outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Popular Search Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Popular:</span>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearch(tag);
                      setActiveCategory("all");
                    }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Assistance Cards (4 Columns) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: FAQs */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold text-[var(--heading)]">Knowledge Base</h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Explore {totalQuestions} detailed articles & step-by-step guides.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                  document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline dark:text-[var(--accent)]"
              >
                <span>Browse all topics</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Card 2: Talk with Agent */}
            <Link
              href="/talkwithagent"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                <Headphones className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold text-[var(--heading)]">Talk With Agent</h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Speak directly with specialized enterprise account advisors.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[var(--primary)] dark:text-[var(--accent)]">
                <span>Connect now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* Card 3: Submit Support Ticket (Drawer) */}
            <button
              type="button"
              onClick={() => {
                setTicketSuccess(null);
                setDrawerOpen(true);
              }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                <Ticket className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-bold text-[var(--heading)]">Submit Ticket</h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Log a priority issue with our technical engineering desk.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[var(--primary)] dark:text-[var(--accent)]">
                <span>Create ticket</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>

            {/* Card 4: System Status */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  99.98%
                </span>
              </div>
              <h3 className="mt-3 font-bold text-[var(--heading)]">System Operational</h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                All WhatsApp gateways, SMS routes, and cloud vaults active.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Zero Active Incidents</span>
              </div>
            </div>

          </div>

          {/* Category Tabs Section */}
          <div id="faq-section" className="space-y-6 scroll-mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent)]">
                  Frequently Asked Questions
                </span>
                <h2 className="mt-1 text-2xl font-bold text-[var(--heading)]">
                  Browse by Category
                </h2>
              </div>

              {search && (
                <div className="text-xs text-[var(--text-secondary)]">
                  Showing <strong>{matchingQuestionsCount}</strong> result(s) for &quot;{search}&quot;
                </div>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeCategory === "all"
                    ? "bg-[var(--primary)] text-white shadow-md dark:bg-[var(--accent)] dark:text-[#0b1220]"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--heading)]"
                }`}
              >
                <span>All Topics</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    activeCategory === "all"
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0b1220]"
                      : "bg-[var(--border)] text-[var(--text-secondary)]"
                  }`}
                >
                  {totalQuestions}
                </span>
              </button>

              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-md dark:bg-[var(--accent)] dark:text-[#0b1220]"
                        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--heading)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.title}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#0b1220]"
                          : "bg-[var(--border)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {cat.questions.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Questions Render List */}
            {filteredCategories.length === 0 ? (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                  <CircleHelp className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[var(--heading)]">
                  No matching answers found
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
                  We could not find anything matching &quot;{search}&quot;. Try another term or submit a support ticket to our team.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory("all");
                    }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--primary)]"
                  >
                    Reset Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white dark:bg-[var(--accent)] dark:text-[#0b1220]"
                  >
                    Submit Support Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredCategories.map((category) => {
                  const CatIcon = category.icon;

                  return (
                    <div key={category.id} className="space-y-3">
                      {/* Category Header */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                            <CatIcon className="h-4 w-4" />
                          </div>
                          <h3 className="text-base font-bold text-[var(--heading)]">
                            {category.title}
                          </h3>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)]">
                          {category.questions.length} {category.questions.length === 1 ? "article" : "articles"}
                        </span>
                      </div>

                      {/* Accordion Container */}
                      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm divide-y divide-[var(--border)]">
                        {category.questions.map((item) => {
                          const ItemIcon = item.icon;
                          const isExpanded = expanded === item.id;
                          const vote = helpfulVotes[item.id];

                          return (
                            <div key={item.id} className="transition-colors">
                              <button
                                type="button"
                                onClick={() => handleAccordion(item.id)}
                                className={`flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[var(--bg)]/50 ${
                                  isExpanded ? "bg-[var(--bg)]/40 font-semibold" : ""
                                }`}
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                      isExpanded
                                        ? "bg-[var(--primary)] text-white dark:bg-[var(--accent)] dark:text-[#0b1220]"
                                        : "bg-[var(--border)]/60 text-[var(--text-secondary)]"
                                    }`}
                                  >
                                    <ItemIcon className="h-4 w-4" />
                                  </div>
                                  <span className="text-sm font-semibold text-[var(--heading)]">
                                    {item.question}
                                  </span>
                                </div>

                                <ChevronDown
                                  className={`h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {isExpanded && (
                                <div className="border-t border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 sm:pl-16 space-y-4">
                                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                                    {item.answer}
                                  </p>

                                  {/* Step by step list if available */}
                                  {item.steps && item.steps.length > 0 && (
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/70 p-4 space-y-2.5">
                                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--heading)]">
                                        Step-by-Step Instructions:
                                      </div>
                                      <ol className="space-y-2 text-xs text-[var(--text-primary)]">
                                        {item.steps.map((step, sIdx) => (
                                          <li key={sIdx} className="flex items-start gap-2">
                                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[10px] font-bold text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                                              {sIdx + 1}
                                            </span>
                                            <span>{step}</span>
                                          </li>
                                        ))}
                                      </ol>
                                    </div>
                                  )}

                                  {/* Contextual Shortcut Link */}
                                  {item.shortcut && (
                                    <div className="pt-1">
                                      <Link
                                        href={item.shortcut.href}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline dark:text-[var(--accent)]"
                                      >
                                        <span>{item.shortcut.label}</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </Link>
                                    </div>
                                  )}

                                  {/* Feedback: Was this helpful? */}
                                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-secondary)]">
                                    <span>Was this answer helpful?</span>
                                    {vote ? (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        Thank you for your feedback!
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleVote(item.id, "yes")}
                                          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-medium hover:border-emerald-500 hover:text-emerald-600"
                                        >
                                          <ThumbsUp className="h-3.5 w-3.5" />
                                          <span>Yes</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleVote(item.id, "no")}
                                          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-medium hover:border-red-500 hover:text-red-600"
                                        >
                                          <ThumbsDown className="h-3.5 w-3.5" />
                                          <span>No</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Multi-Channel Assistance Footer Card */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-sm">
            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent)]">
                    Still Need Assistance?
                  </span>
                  <h3 className="text-2xl font-black text-[var(--heading)]">
                    Connect With Our Practice Support Team
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                  Our specialists understand GST, MCA filing cycles, and CA firm operational workflows.
                </p>
              </div>

              {/* 3 Contact Options Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Phone */}
                <a
                  href="tel:+918866189222"
                  className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 p-5 transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:bg-[var(--surface)] hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--heading)]">Direct CA Hotline</h4>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        +91 8866189222
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-[var(--primary)] dark:text-[var(--accent)]">
                    <span>Call our desk</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:support@remindca.com"
                  className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 p-5 transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:bg-[var(--surface)] hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--heading)]">Email Helpdesk</h4>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        support@remindca.com
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-[var(--primary)] dark:text-[var(--accent)]">
                    <span>Average reply &lt; 2h</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/918866189222?text=Hello%20RemindCA%20Support%2C%20I%20need%20assistance%20with%20my%20firm%20workspace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 p-5 transition-all hover:-translate-y-1 hover:border-[var(--primary)] hover:bg-[var(--surface)] hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--accent)]/15 dark:text-[var(--accent)]">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--heading)]">WhatsApp Support</h4>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        Chat directly with support
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-[var(--primary)] dark:text-[var(--accent)]">
                    <span>Message WhatsApp</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Slide-Over Support Request Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Submit Support Request"
        eyebrow="RemindCA Help Desk"
        icon={<Ticket className="h-5 w-5 text-white" />}
        width="md"
        submitLabel={submitting ? "Submitting Request..." : "Submit Ticket"}
        submitting={submitting}
        onSubmit={ticketSuccess ? undefined : () => {
          const formEl = document.getElementById("support-ticket-form") as HTMLFormElement;
          if (formEl) formEl.requestSubmit();
        }}
        onCancel={() => setDrawerOpen(false)}
        cancelLabel={ticketSuccess ? "Close Window" : "Cancel"}
      >
        {ticketSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-[var(--heading)]">
              Support Ticket Created
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Your inquiry has been assigned Reference ID:
            </p>
            <div className="inline-block rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-2 font-mono text-base font-extrabold text-[var(--primary)] dark:text-[var(--accent)]">
              #{ticketSuccess}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Our engineering helpdesk has received your ticket details. You will receive an email confirmation and updates directly at your registered email address within 2 hours.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white dark:bg-[var(--accent)] dark:text-[#0b1220]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            id="support-ticket-form"
            onSubmit={handleTicketSubmit}
            className="p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-[var(--heading)] mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                placeholder="e.g. CA Rajesh Kumar"
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--heading)] mb-1">
                Firm / Practice Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ticketForm.firmName}
                onChange={(e) => setTicketForm({ ...ticketForm, firmName: e.target.value })}
                placeholder="e.g. Kumar & Associates Chartered Accountants"
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--heading)] mb-1">
                Email Address for Updates <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={ticketForm.email}
                onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                placeholder="firm@example.com"
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--heading)] mb-1">
                  Category
                </label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="WhatsApp Delivery">WhatsApp Delivery</option>
                  <option value="Billing & Invoices">Billing & Invoices</option>
                  <option value="Client Import">Client Import</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--heading)] mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="Normal">Normal (Filing not blocked)</option>
                  <option value="High">High (Filing deadline soon)</option>
                  <option value="Urgent">Urgent (Statutory cutoff today)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--heading)] mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                placeholder="Brief summary of your issue"
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--heading)] mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                placeholder="Please describe what happened, affected clients, or any error messages received..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}