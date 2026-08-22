import type {
  GstinEntry,
  ContactEntry,
  AddressEntry,
  ComplianceService,
  CreateClientFormData,
} from '@/types/createClient.types';

// ── Contact & Address options ──────────────────────────
export const CONTACT_ROLES = [
  'OWNER',
  'MANAGER',
  'ACCOUNTANT',
] as const;

export const ADDRESS_TYPES = [
  'REGISTERED',
  'COMMUNICATION',
  'BRANCH',
] as const;

// ── Notification options ───────────────────────────────
export const NOTIFICATION_CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'];

export const COMPLIANCE_FREQUENCIES = [
  'MONTHLY',
  'QUARTERLY',
  'HALF_YEARLY',
  'ANNUALLY',
];

export const TIMEZONES = ['Asia/Kolkata', 'UTC'];

export const LANGUAGES = ['en', 'hi', 'te', 'ta', 'kn', 'ml'];

// ── Default values ─────────────────────────────────────
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
  role: 'OWNER',
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

export const DEFAULT_FORM: CreateClientFormData = {
  fullName: '',
  phone: '',
  email: '',
  companyName: '',
  constitution: '',
  industry: '',
  businessNature: [],
  pan: '',
  tan: '',
  cin: '',
  udyam: '',
  iec: '',
  gstins: [],
  contacts: [],
  addresses: [],
  notifChannels: [],
  notifLanguage: 'en',
  notifTimezone: 'Asia/Kolkata',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  complianceGst: { ...DEFAULT_COMPLIANCE },
  complianceTds: { ...DEFAULT_COMPLIANCE },
  complianceItr: { ...DEFAULT_COMPLIANCE },
  complianceRoc: { ...DEFAULT_COMPLIANCE },
  tags: [],
  tagInput: '',
  notes: '',
};