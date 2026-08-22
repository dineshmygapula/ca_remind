import type {
  ComplianceService,
  GstinEntry,
  ContactEntry,
  AddressEntry,
  FormData,
} from '@/types/subject';


// ─────────────────────────────────────────────
// Indian States (Proper Case with Spaces)
// ─────────────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Chandigarh',
  'Puducherry',
];

// ─────────────────────────────────────────────
// Business Constitutions
// ─────────────────────────────────────────────
export const CONSTITUTIONS = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'PROPRIETORSHIP', label: 'Proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'PRIVATE_LIMITED', label: 'Private Limited (Pvt Ltd)' },
  { value: 'PUBLIC_LIMITED', label: 'Public Limited' },
  { value: 'LLP', label: 'Limited Liability Partnership (LLP)' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'SOCIETY', label: 'Society' },
  { value: 'HUF', label: 'Hindu Undivided Family (HUF)' },
  { value: 'OPC', label: 'One Person Company (OPC)' },
];

// ─────────────────────────────────────────────
// Industries
// ─────────────────────────────────────────────
export const INDUSTRIES = [
  'Manufacturing',
  'Trading',
  'Services',
  'IT/Software',
  'Construction',
  'Real Estate',
  'Healthcare',
  'Education',
  'Hospitality',
  'Retail',
  'Agriculture',
  'Textiles',
  'Finance',
  'Consulting',
  'Transportation',
  'Other',
];

// ─────────────────────────────────────────────
// Business Natures
// ─────────────────────────────────────────────
export const BUSINESS_NATURES = [
  'Wholesale',
  'Retail',
  'Export',
  'Import',
  'Manufacturing',
  'Services',
  'Trading',
  'Distribution',
];

// ─────────────────────────────────────────────
// Compliance Services
// ─────────────────────────────────────────────
export const COMPLIANCE_SERVICES = [
  { value: 'GST', label: 'GST', icon: '🧾' },
  { value: 'TDS', label: 'TDS', icon: '💰' },
  { value: 'ITR', label: 'ITR', icon: '📋' },
  { value: 'ROC', label: 'ROC', icon: '🏛️' },
  { value: 'MSME', label: 'MSME', icon: '�' },
];

// ─────────────────────────────────────────────
// Status Options
// ─────────────────────────────────────────────
export const CLIENT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export type ClientStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';


//create client dialog constants


// ─────────────────────────────────────────────
// Form Option Constants
// ─────────────────────────────────────────────
export const CONTACT_ROLES = ['OWNER', 'STAFF', 'MANAGER'] as const;

export const ADDRESS_TYPES = ['REGISTERED', 'COMMUNICATION', 'BRANCH'] as const;

export const NOTIFICATION_CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'];

export const COMPLIANCE_FREQUENCIES = [
  { value: "MONTHLY",   label: "Monthly"   },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL",    label: "Annual"    },
];

export const TIMEZONES = ['Asia/Kolkata', 'UTC'];

export const LANGUAGES = ['english'];

// ─────────────────────────────────────────────
// Default Values
// ─────────────────────────────────────────────
export const DEFAULT_COMPLIANCE: ComplianceService = {
  enabled: false,
  frequency: 'QUARTERLY',
};

export const DEFAULT_GSTIN: GstinEntry = {
  gstin: '',
  state: '',
  registrationType: 'REGULAR',
  status: 'ACTIVE',
};

export const DEFAULT_CONTACT: ContactEntry = {
  name: '',
  role: 'ACCOUNTANT',
  phone: '',
  email: '',
  isPrimary: false,
};

export const DEFAULT_ADDRESS: AddressEntry = {
  type: 'REGISTERED',
  line1: '',
  city: '',
  state: '',
  pincode: '',
};

export const DEFAULT_FORM: FormData = {
  fullName: '', phone: '', email: '',
  companyName: '', constitution: '', industry: '', businessNature: [],
  pan: '', tan: '', cin: '', udyam: '', iec: '',
  gstins: [],
  contacts: [],
  addresses: [],
  notifChannels: [], notifLanguage: 'en', notifTimezone: 'Asia/Kolkata',
  quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '08:00',
  complianceGst:  { ...DEFAULT_COMPLIANCE },
  complianceTds:  { ...DEFAULT_COMPLIANCE },
  complianceItr:  { ...DEFAULT_COMPLIANCE },
  complianceRoc:  { ...DEFAULT_COMPLIANCE },
  complianceMsme: { ...DEFAULT_COMPLIANCE },
  tags: [], tagInput: '',
  notes: '',
  assignedTeam: { primaryAssigneeId: '', primaryAssigneeName: '' },
  isActive: true,
};

