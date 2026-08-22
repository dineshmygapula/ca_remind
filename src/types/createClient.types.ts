export interface GstinEntry {
  gstin: string;
  state: string;
  registrationType: 'REGULAR' | 'COMPOSITION' | 'EXEMPTED';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ContactEntry {
  name: string;
  role: 'OWNER'  | 'MANAGER' | 'ACCOUNTANT' ;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface AddressEntry {
  type: 'REGISTERED' | 'COMMUNICATION' | 'BRANCH';
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ComplianceService {
  enabled: boolean;
  frequency: string;
}

export interface CreateClientFormData {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  constitution: string;
  industry: string;
  businessNature: string[];
  pan: string;
  tan: string;
  cin: string;
  udyam: string;
  iec: string;
  gstins: GstinEntry[];
  contacts: ContactEntry[];
  addresses: AddressEntry[];
  notifChannels: string[];
  notifLanguage: string;
  notifTimezone: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  complianceGst: ComplianceService;
  complianceTds: ComplianceService;
  complianceItr: ComplianceService;
  complianceRoc: ComplianceService;
  tags: string[];
  tagInput: string;
  notes: string;
}

export interface CreateClientFormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  pan?: string;
  gstins?: string[];
  contacts?: string[];
}

export interface AddClientDialogProps {
  businessId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}