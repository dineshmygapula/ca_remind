
import { 
  CreateSubjectDto,
  SubjectProfile,
  SubjectIdentifiers,
  GSTInfo,
  PrimaryContact,
  Contact,
  Address,
  NotificationPreferences,
  SubjectMetadata,
  ServiceType,
} from './subject';

// Add this interface specifically for the stepper form
export interface StepperClientFormData {
  // Step 1: Client Details
  displayName: string;
  legalName: string;
  constitution: string;
  industry: string;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  
  // Step 2: Business Identifiers & Services
  pan: string;
  tan?: string;
  cin?: string;
  udyam?: string;
  iec?: string;
  gstin: string;
  gstinState: string;
  serviceTypes: ServiceType[]; // GST, ITR, ROC, TDS, MSME
  
  // Step 3: Address & Notifications
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  notificationChannels: string[]; // WHATSAPP, EMAIL, SMS
}

// Add converter for stepper form
export const convertStepperFormToCreateDto = (
  formData: StepperClientFormData
): CreateSubjectDto => {
  // Profile - REQUIRED
  const profile: SubjectProfile = {
    displayName: formData.displayName,
    legalName: formData.legalName,
    businessName: formData.displayName,
    constitution: formData.constitution,
    industry: formData.industry,
    businessNature: ['Trading'], // Default
  };
  
  // Identifiers - Include all provided values
  const identifiers: SubjectIdentifiers = {
    pan: formData.pan.trim().toUpperCase(),
  };
  if (formData.tan && formData.tan.trim()) {
    identifiers.tan = formData.tan.trim().toUpperCase();
  }
  if (formData.cin && formData.cin.trim()) {
    identifiers.cin = formData.cin.trim().toUpperCase();
  }
  if (formData.udyam && formData.udyam.trim()) {
    identifiers.udyam = formData.udyam.trim().toUpperCase();
  }
  if (formData.iec && formData.iec.trim()) {
    identifiers.iec = formData.iec.trim();
  }
  
  // GST - Use gstinState for state
  const gst: GSTInfo = {
    gstins: [
      {
        gstin: formData.gstin.trim().toUpperCase(),
        state: formData.gstinState.replace(/ /g, '_').toUpperCase(), // Convert "Andhra Pradesh" to "ANDHRA_PRADESH"
        registrationType: 'REGULAR',
        status: 'ACTIVE',
      },
    ],
  };
  
  // Primary Contact - REQUIRED
  const primaryContact: PrimaryContact = {
    name: formData.primaryContactName,
    phone: formData.primaryContactPhone,
    email: formData.primaryContactEmail,
  };
  
  // Contacts - Include primary as first contact
  const contacts: Contact[] = [
    {
      name: formData.primaryContactName,
      role: 'OWNER',
      phone: formData.primaryContactPhone,
      email: formData.primaryContactEmail,
      isPrimary: true,
    },
  ];
  
  // Addresses - REQUIRED
  const address: Address = {
    type: 'REGISTERED',
    line1: formData.addressLine1,
    city: formData.city,
    state: formData.state.replace(/ /g, '_').toUpperCase(), // Convert to UPPER_SNAKE_CASE
    pincode: formData.pincode,
  };
  
  if (formData.addressLine2 && formData.addressLine2.trim()) {
    address.line2 = formData.addressLine2.trim();
  }
  
  const addresses: Address[] = [address];
  
  // Notification Preferences - REQUIRED
  const notificationPreferences: NotificationPreferences = {
    defaultChannels: formData.notificationChannels,
    language: 'en',
    timezone: 'Asia/Kolkata',
    quietHours: {
      enabled: false,
      start: '',
      end: '',
    },
  };
  
  // Metadata - Build complianceProfile from serviceTypes
  const metadata: SubjectMetadata = {
    complianceProfile: {
      gst: { enabled: formData.serviceTypes.includes('GST') },
      tds: { enabled: formData.serviceTypes.includes('TDS') },
      itr: { enabled: formData.serviceTypes.includes('ITR') },
      roc: { enabled: formData.serviceTypes.includes('ROC') },
      msme: { enabled: formData.serviceTypes.includes('MSME') },
    },
    dueDateOverrides: [],
    tags: formData.serviceTypes, // Use selected services as tags
  };
  
  // Build DTO
  return {
    subjectType: 'CLIENT',
    profile,
    identifiers,
    gst,
    primaryContact,
    contacts,
    addresses,
    notificationPreferences,
    metadata,
    isActive: true,
  };
};