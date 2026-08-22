"use client";

import { useState } from "react";
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
} from "lucide-react";

const categories = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: Rocket,
        questions: [
            {
                icon: Rocket,
                question: "How do I create my first business account in RemindCA?",
                answer:
                    "To create your first business account, log in to RemindCA and navigate to the Business Setup section. Fill in your firm name, contact details, GSTIN (if applicable), and other required information. Once saved, your business profile will be active and ready to use.",
            },
            {
                icon: Info,
                question: "What information is mandatory to create my Business Page?",
                answer:
                    "The mandatory fields for creating a Business Page are: Business Name, Owner Name, Mobile Number, and Business Type. Optional fields like GSTIN, Address, and Logo can be filled in later to complete your profile.",
            },
            {
                icon: Building2,
                question: "How do I update my firm's information after setup?",
                answer:
                    "Go to Settings → Business Profile and click Edit. You can update your firm name, contact number, address, GSTIN, and logo at any time. Changes are saved immediately after confirmation.",
            },
            {
                icon: LayoutDashboard,
                question:
                    "What do the numbers on the Dashboard (Overdue, Today, Upcoming) represent?",
                answer:
                    "These numbers represent your task and reminder status at a glance. Overdue shows tasks that have passed their due date without completion. Today shows tasks due on the current date. Upcoming shows tasks scheduled for the next 7 days.",
            },
            {
                icon: KeyRound,
                question: "How do I reset my password if I cannot log in?",
                answer:
                    "On the login screen, tap 'Forgot Password' and enter your registered email address. You will receive a password reset link within a few minutes. Check your spam folder if the email does not arrive. Follow the link to set a new password.",
            },
        ],
    },
    {
        id: "client-management",
        title: "Client Management",
        icon: Users,
        questions: [
            {
                icon: SmilePlus,
                question:
                    "How do I add a new client and specify their service types (GST, ITR, etc.)?",
                answer:
                    "Navigate to the Clients section and tap the '+' button. Enter the client's name, contact details, and select the applicable service types from the list (GST, ITR, ROC, TDS, etc.). You can assign multiple service types to a single client.",
            },
            {
                icon: Clock,
                question:
                    "How do I view all scheduled and active reminders for a specific client?",
                answer:
                    "Open the client's profile by tapping on their name in the Clients list. Scroll to the Reminders section to see all scheduled, sent, and pending reminders associated with that client.",
            },
            {
                icon: ListFilter,
                question: "How do I use the filter options in the Client List?",
                answer:
                    "In the Clients section, tap the Filter icon at the top right. You can filter clients by Service Type, Active/Inactive status, or Assigned Staff. Multiple filters can be applied simultaneously.",
            },
            {
                icon: FilePlus2,
                question: "Can I add short, private notes about a client?",
                answer:
                    "Yes. Open the client's profile and scroll to the Notes section. Tap 'Add Note' to write a private internal note. These notes are only visible to your firm's users and are never shared with the client.",
            },
            {
                icon: UserMinus,
                question: "How can I edit or delete an existing client's details?",
                answer:
                    "Open the client's profile, tap the Edit (pencil) icon to modify details, or tap the three-dot menu to find the Delete option. Note that deleting a client will also remove all their associated tasks and reminders permanently.",
            },
        ],
    },
    {
        id: "reminder-task",
        title: "Reminder & Task Management",
        icon: Bell,
        questions: [
            {
                icon: CalendarDays,
                question: "What are the key steps to creating a new reminder?",
                answer:
                    "To create a reminder: 1) Select the client. 2) Choose the task type (e.g. GST, TDS). 3) Enter the task name. 4) Select Send Now or Schedule a date and time. 5) Choose the delivery channel (Email, WhatsApp, SMS). 6) The message template is auto-filled. 7) Tap Send Reminder.",
            },
            {
                icon: Repeat,
                question: "How do I set up a reminder to repeat (Recurring Options)?",
                answer:
                    "When creating or editing a reminder, look for the Recurrence option. You can set reminders to repeat Daily, Weekly, Monthly, or Quarterly. Select the end date or number of occurrences to control when the recurring series stops.",
            },
            {
                icon: Bell,
                question:
                    'How does the "Days Before Due" internal notification feature work?',
                answer:
                    'The "Days Before Due" feature automatically triggers an internal notification to your staff a set number of days before a task\'s due date. You can configure this in the Reminder Definition settings. For example, setting it to 5 days will alert your team 5 days before the compliance deadline.',
            },
            {
                icon: ListChecks,
                question:
                    "What are the different Reminder Statuses, and how do I change them?",
                answer:
                    "Reminder statuses are: Scheduled (set for future delivery), Sent (successfully delivered), Failed (delivery failed), and Cancelled (manually stopped). You can update a reminder's status by opening it and selecting the appropriate action from the options menu.",
            },
            {
                icon: ListChecks,
                question: "How can I track client Acknowledgements for a reminder?",
                answer:
                    "Open the reminder details from the Reminders list. The Acknowledgement section shows whether the client has confirmed receipt. You can also manually mark a reminder as acknowledged on behalf of the client if they confirm via a call or in person.",
            },
            {
                icon: ListFilter,
                question: "How do I use the filters on the main Reminders list?",
                answer:
                    "On the Reminders screen, tap the Filter icon to filter by Status (Scheduled, Sent, Failed), Channel (Email, WhatsApp, SMS), Date Range, or Client Name. Combining filters helps you quickly locate specific reminders.",
            },
        ],
    },
    {
        id: "document-task",
        title: "Document & Task Management",
        icon: Paperclip,
        questions: [
            {
                icon: Paperclip,
                question: "How do I attach important client documents to a reminder?",
                answer:
                    "When creating or editing a reminder, look for the Attachments section. Tap 'Add Attachment' to upload files from your device. Supported formats include PDF, JPEG, and PNG. Attachments are stored securely and linked to the specific reminder.",
            },
            {
                icon: ListChecks,
                question: "Can I create internal to-do tasks related to a reminder?",
                answer:
                    "Yes. Inside any reminder, scroll to the Tasks section and tap 'Add Task'. These are internal checklist items visible only to your team. You can assign tasks to specific staff members and mark them as complete when done.",
            },
        ],
    },
    {
        id: "templates",
        title: "Templates & Communication",
        icon: MessageCircle,
        questions: [
            {
                icon: Sparkles,
                question:
                    "Where can I find the automatically created templates for services like ROC and TDS?",
                answer:
                    "Go to Settings → Message Templates. Pre-built templates for common services like GST, TDS, ROC, and ITR are available by default. You can view, duplicate, or customize these templates to match your firm's communication style.",
            },
            {
                icon: MessageSquare,
                question: "How do I create and save my own custom message template?",
                answer:
                    "In Settings → Message Templates, tap the '+' button. Enter a template name, select the channel (Email/WhatsApp/SMS), and write your message using the available placeholders like [CLIENTNAME], [DUEDATE], and [YOURFIRMNAME]. Save the template to make it available when sending reminders.",
            },
            {
                icon: MessageCircle,
                question: "How can I send a reminder message directly via WhatsApp?",
                answer:
                    "When creating a reminder, select WhatsApp as the Delivery Channel. The system will use your WhatsApp template and open the WhatsApp app (or web) pre-filled with the client's number and message. Tap Send to deliver it. Note: Ensure the client's WhatsApp number is saved in their profile.",
            },
        ],
    },
    {
        id: "billing",
        title: "Subscription & Billing",
        icon: CreditCard,
        questions: [
            {
                icon: Star,
                question:
                    "What are the main benefits of a RemindCA Premium Membership?",
                answer:
                    "RemindCA Premium gives you unlimited clients, unlimited reminders, WhatsApp integration, priority support, advanced analytics, custom branding, and access to all future features. Free plans are limited in the number of clients and reminders you can manage.",
            },
            {
                icon: WalletCards,
                question: "How do I manage or cancel my Premium subscription?",
                answer:
                    "Go to Settings → Subscription & Billing. You can view your current plan, upgrade, downgrade, or cancel your subscription from this screen. Cancellations take effect at the end of the current billing cycle. Refunds are subject to the Terms of Service.",
            },
        ],
    },
    {
        id: "privacy",
        title: "Privacy & Legal",
        icon: Lock,
        questions: [
            {
                icon: ShieldCheck,
                question: "Where can I review RemindCA's Privacy Policy and Terms?",
                answer:
                    "You can find the Privacy Policy and Terms of Service in Settings → About → Legal. These documents are also available on our website at remindca.com/privacy and remindca.com/terms.",
            },
        ],
    },
    {
        id: "troubleshooting",
        title: "Troubleshooting & Support",
        icon: Wrench,
        questions: [
            {
                icon: BellOff,
                question:
                    "Why are my reminders not sending or why am I not getting notifications?",
                answer:
                    "Check the following: 1) Ensure notification permissions are enabled for RemindCA on your device. 2) Verify the reminder status is 'Scheduled' and not 'Cancelled'. 3) Check that the client's email or phone number is correctly saved. 4) For WhatsApp, ensure the number is active on WhatsApp. 5) Check your internet connection.",
            },
            {
                icon: Gauge,
                question:
                    "The app is running slow or keeps crashing. What should I do?",
                answer:
                    "Try these steps: 1) Close and reopen the app. 2) Clear the app cache in your device settings. 3) Ensure you are using the latest version of RemindCA from the App Store or Play Store. 4) Restart your device. If the issue persists, contact our support team with your device model and app version.",
            },
            {
                icon: Headphones,
                question: "How do I contact a RemindCA support agent directly?",
                answer:
                    "You can reach our support team via: Email at support@remindca.com, Phone at +91 8866189222 (Mon–Sat, 9 AM–6 PM IST), or through the in-app chat by going to Settings → Help & Support → Talk with Agent.",
            },
        ],
    },
];

export default function HelpSupport() {
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleAccordion = (panel: string) => {
        setExpanded((current) => (current === panel ? false : panel));
    };

    const filteredCategories = categories
        .map((category) => ({
            ...category,
            questions: category.questions.filter(
                (question) =>
                    search.trim() === "" ||
                    question.question.toLowerCase().includes(search.toLowerCase()) ||
                    question.answer.toLowerCase().includes(search.toLowerCase())
            ),
        }))
        .filter((category) => category.questions.length > 0);

    const totalQuestions = categories.reduce(
        (sum, category) => sum + category.questions.length,
        0
    );

    const filteredQuestionCount = filteredCategories.reduce(
        (sum, category) => sum + category.questions.length,
        0
    );

    return (
        <div className="min-h-screen bg-[var(--bg)] py-8 text-[var(--text-primary)]">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">

                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                                    <CircleHelp className="h-[18px] w-[18px] text-[var(--primary)]" />
                                </div>

                                <h1 className="text-2xl font-bold text-[var(--heading)]">
                                    Help & Support
                                </h1>
                            </div>

                            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                                Find answers to common questions about RemindCA
                            </p>
                        </div>

                        <span className="w-fit rounded-md bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)]">
                            {totalQuestions} Articles
                        </span>
                    </div>

                    {/* Search */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search for help topics, questions, or keywords..."
                                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-[var(--border)]
                  bg-[var(--bg)]
                  pl-11
                  pr-4
                  text-sm
                  text-[var(--text-primary)]
                  outline-none
                  placeholder:text-[var(--text-secondary)]
                  focus:border-[var(--primary)]
                  focus:ring-2
                  focus:ring-[var(--primary)]/10
                "
                            />
                        </div>

                        {search.trim() !== "" && (
                            <p className="mt-3 text-sm text-[var(--text-secondary)]">
                                {filteredQuestionCount} result(s) found for{" "}
                                <strong className="text-[var(--text-primary)]">
                                    &quot;{search}&quot;
                                </strong>
                            </p>
                        )}
                    </div>

                    {/* Category Quick Navigation */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const Icon = category.icon;

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => {
                                        document
                                            .getElementById(category.id)
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                    }}
                                    className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-md
                    border
                    border-[var(--border)]
                    bg-[var(--surface)]
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-[var(--text-primary)]
                    transition-all
                    hover:border-[var(--primary)]
                    hover:bg-[var(--primary)]/5
                  "
                                >
                                    <Icon className="h-4 w-4 text-[var(--primary)]" />
                                    {category.title}
                                </button>
                            );
                        })}
                    </div>

                    {/* FAQ Sections */}
                    {filteredCategories.length === 0 ? (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
                            <CircleHelp className="mx-auto h-10 w-10 text-[var(--text-secondary)]" />

                            <h2 className="mt-4 text-lg font-semibold text-[var(--text-secondary)]">
                                No results found
                            </h2>

                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Try a different search term
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {filteredCategories.map((category) => {
                                const CategoryIcon = category.icon;

                                return (
                                    <section
                                        key={category.id}
                                        id={category.id}
                                        className="scroll-mt-6"
                                    >
                                        {/* Category Header */}
                                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                                                    <CategoryIcon className="h-[18px] w-[18px] text-[var(--primary)]" />
                                                </div>

                                                <h2 className="text-lg font-bold text-[var(--heading)]">
                                                    {category.title}
                                                </h2>
                                            </div>

                                            <span className="w-fit rounded-md bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)]">
                                                {category.questions.length}{" "}
                                                {category.questions.length === 1
                                                    ? "topic"
                                                    : "topics"}
                                            </span>
                                        </div>

                                        {/* Questions */}
                                        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                                            {category.questions.map((item, qIndex) => {
                                                const ItemIcon = item.icon;
                                                const panelId = `${category.id}-${qIndex}`;
                                                const isExpanded = expanded === panelId;

                                                return (
                                                    <div key={panelId}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAccordion(panelId)}
                                                            className={`
                                flex
                                min-h-14
                                w-full
                                items-center
                                gap-4
                                px-5
                                py-3
                                text-left
                                transition-colors
                                hover:bg-[var(--bg)]
                                ${isExpanded
                                                                    ? "border-l-[3px] border-[var(--primary)] bg-[var(--bg)]"
                                                                    : "border-l-[3px] border-transparent"
                                                                }
                              `}
                                                        >
                                                            <ItemIcon className="h-[18px] w-[18px] shrink-0 text-[var(--text-secondary)]" />

                                                            <span className="flex-1 text-sm font-semibold leading-6 text-[var(--text-primary)]">
                                                                {item.question}
                                                            </span>

                                                            <ChevronDown
                                                                className={`h-5 w-5 shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                                                                    }`}
                                                            />
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="border-t border-[var(--border)] px-5 pb-5 pt-4 pl-[4.5rem]">
                                                                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                                                                    {item.answer}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {qIndex < category.questions.length - 1 && (
                                                            <div className="mx-5 h-px bg-[var(--border)]" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}

                    {/* Contact Footer */}
                    <section>
                        <div className="mb-6 h-px bg-[var(--border)]" />

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">

                                <div>
                                    <h2 className="text-lg font-bold text-[var(--heading)]">
                                        Still need help?
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                        Our support team is available Mon–Sat, 9 AM–6 PM IST
                                    </p>
                                </div>

                                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-[420px]">
                                    <a
                                        href="tel:+918866189222"
                                        className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--primary)]/5 p-3 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                                            <Phone className="h-[18px] w-[18px] text-[var(--primary)]" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-[var(--text-primary)]">
                                                Call Us
                                            </p>

                                            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                                +91 8866189222
                                            </p>
                                        </div>

                                        <ArrowRight className="ml-auto h-4 w-4 text-[var(--primary)]" />
                                    </a>

                                    <a
                                        href="mailto:support@remindca.com"
                                        className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--primary)]/5 p-3 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                                            <Mail className="h-[18px] w-[18px] text-[var(--primary)]" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-[var(--text-primary)]">
                                                Email Us
                                            </p>

                                            <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                                                support@remindca.com
                                            </p>
                                        </div>

                                        <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[var(--primary)]" />
                                    </a>
                                </div>

                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}