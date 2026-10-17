// ─────────────────────────────────────────────
// Channel Options
// ─────────────────────────────────────────────
export const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { value: 'sms', label: 'SMS', icon: '💬' },
  { value: 'in_app', label: 'In-App', icon: '🔔' },
] as const;

// ─────────────────────────────────────────────
// Reminder Type Options
// ─────────────────────────────────────────────
export const REMINDER_TYPE_OPTIONS = [
  { value: 'GST', label: 'GST' },
  { value: 'TDS', label: 'TDS' },
  { value: 'ITR', label: 'Income Tax Return' },
  { value: 'ROC', label: 'ROC Filing' },
  { value: 'ESI', label: 'ESI' },
  { value: 'PF', label: 'Provident Fund' },
  { value: 'GENERAL', label: 'General' },
] as const;

// ─────────────────────────────────────────────
// Business Category Options
// ─────────────────────────────────────────────
export const BUSINESS_CATEGORY_OPTIONS = [
  { value: 'ACCOUNTS', label: 'Accounts' },
  { value: 'TAX', label: 'Tax' },
  { value: 'COMPLIANCE', label: 'Compliance' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'GENERAL', label: 'General' },
] as const;

// ─────────────────────────────────────────────
// Common Placeholders
// ─────────────────────────────────────────────
export const COMMON_PLACEHOLDERS = [
  { value: 'CLIENTNAME', label: 'Client Name', description: 'Name of the client' },
  { value: 'BUSINESSNAME', label: 'Business Name', description: 'Client business name' },
  { value: 'DUEDATE', label: 'Due Date', description: 'Task/filing due date' },
  { value: 'SERVICETYPE', label: 'Service Type', description: 'Type of service/filing' },
  { value: 'YOURFIRMNAME', label: 'Your Firm Name', description: 'Your company name' },
  { value: 'YOURCONTACTNUMBER', label: 'Your Contact Number', description: 'Your phone number' },
  { value: 'AMOUNT', label: 'Amount', description: 'Payment or filing amount' },
  { value: 'PERIODSTART', label: 'Period Start', description: 'Reporting period start' },
  { value: 'PERIODEND', label: 'Period End', description: 'Reporting period end' },
  { value: 'GSTIN', label: 'GSTIN', description: 'GST identification number' },
  { value: 'PAN', label: 'PAN', description: 'Permanent account number' },
  { value: 'FINANCIALYEAR', label: 'Financial Year', description: 'Financial year' },
] as const;

// ─────────────────────────────────────────────
// Filter Options
// ─────────────────────────────────────────────
export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export type ChannelFilter = 'ALL' | 'email' | 'whatsapp';

export const CHANNEL_FILTER_OPTIONS = [
  { value: 'ALL',      label: 'All' },
  { value: 'email',    label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export type ReminderTypeFilter = 'ALL' | 'GST' | 'TDS' | 'ITR' | 'ROC' | 'MSME';

export const REMINDER_TYPE_FILTER_OPTIONS = [
  { value: 'ALL',  label: 'All' },
  { value: 'GST',  label: 'GST' },
  { value: 'TDS',  label: 'TDS' },
  { value: 'ITR',  label: 'ITR' },
  { value: 'ROC',  label: 'ROC' },
  { value: 'MSME', label: 'MSME' },
];

export type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';



// ─────────────────────────────────────────────
// Default Templates
// ─────────────────────────────────────────────
export const DEFAULT_EMAIL_TEMPLATE = {
  subject: 'Reminder: [SERVICETYPE] Filing Due on [DUEDATE]',
  body: `Hello [CLIENTNAME] – [BUSINESSNAME],

🔔 This is a reminder that your [SERVICETYPE] for [BUSINESSNAME] is due on [DUEDATE].
Kindly ensure all documents and payments are completed on time to avoid penalties.

Best regards,
[YOURFIRMNAME]
[YOURCONTACTNUMBER]`,
};

export const DEFAULT_WHATSAPP_TEMPLATE = {
  body: `👋 Hi [CLIENTNAME] – [BUSINESSNAME],

🔔 Reminder: Your [SERVICETYPE] for [BUSINESSNAME] is due on [DUEDATE].
Please complete the process and confirm once done ✅.
Thank you
– [YOURFIRMNAME]`,
};

export const DEFAULT_SMS_TEMPLATE = {
  body: '[SERVICETYPE] due on [DUEDATE] for [BUSINESSNAME]. Please complete on time. – [YOURFIRMNAME]',
};

export const DEFAULT_INAPP_TEMPLATE = {
  body: 'Reminder: [SERVICETYPE] for [BUSINESSNAME] is due on [DUEDATE]. Please complete on time.',
};