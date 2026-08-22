// =====================================================
// 🔰 COMMON / SHARED TYPES (Used across all APIs)
// =====================================================


// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────
export type SubjectType = 'CLIENT' | string;
export type GstRegistrationType = 'REGULAR' | 'COMPOSITION' | 'EXEMPTED';
export type GstStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
export type ContactRole = 'OWNER' | 'ACCOUNTANT' | 'MANAGER';
export type AddressType = 'REGISTERED' | 'OPERATIONAL' | 'COMMUNICATION' | 'BRANCH';
export type TaskStatus = 'UPCOMING' | 'OPEN' | 'COMPLETED';
export type RowAction = 'TASK_DETAILS' | string;
export type ServiceType = 'GST' | 'ITR' | 'ROC' | 'TDS' | 'MSME';

export type GSTInfo = SubjectGst;
export type Contact = SubjectContact;
export type Address = SubjectAddress;


// 1. Reusable Nested Structures
// =====================================================
// 🧩 REUSABLE NESTED STRUCTURES
// 👉 Used in Create, Update, and View APIs
// =====================================================

// ─────────────────────────────────────────────
// Nested Structures
// ─────────────────────────────────────────────
export interface SubjectProfile {
  displayName: string;
  legalName: string;
  businessName: string;
  constitution: string;
  industry: string;
  businessNature: string[];
}

export interface SubjectIdentifiers {
  pan?: string;
  tan?: string;
  cin?: string;
  udyam?: string;
  iec?: string | null;
}



  export interface GstEntry {
  gstin: string;
  state: string;
  registrationType: GstRegistrationType;
  status: GstStatus;

  additionalPlaceAddressIds?: string[];
}

export interface SubjectGst {
  gstins: GstEntry[];
}

export interface PrimaryContact {
  name: string;
  phone: string;
  email: string;
}



  export interface SubjectContact {
  contactId?: string;
  name: string;
  role: ContactRole;
  phone: string;
  email: string;
  isPrimary: boolean;

  preferredChannels?: string[];
}



  export interface SubjectAddress {
  addressId?: string;
  type: AddressType;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;

  country?: string;
  isActive?: boolean;
}

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}



 export interface NotificationPreferences {
  defaultChannels: string[];
  language: string;
  timezone: string;

  quietHours: QuietHours;

  overrides?: unknown[];
}
export interface AssignedTeamMember {
  userId?: string;
  name?: string | null;
}

//✅ IMPORTANT: This is used in Create + Update + View
export interface AssignedTeam {
  primaryAssignee?: AssignedTeamMember | null;
}



export interface SubjectNote {
  noteId?: string;
  text: string;
  createdBy?: {
    userId: string;
    name: string;
  };
  createdAt?: string;
}

export interface ComplianceService {
  enabled: boolean;
  frequency?: string;
  internalTargetOffsetDays?: number;
  customDueDay?: number;
  customDueMonth?: string;
}

// ✅ Single declaration — includes msme
export interface SubjectMetadata {
  complianceProfile: {
    gst:  ComplianceService;
    tds:  ComplianceService;
    itr:  ComplianceService;
    roc:  ComplianceService;
    msme: ComplianceService;
  };
  dueDateOverrides: (null | unknown)[];
  tags: string[];
}

// 2. LIST API (Table UI)
// =====================================================
// 📥 LIST SUBJECTS (Table View)
// 👉 Used in ClientsTable (UI Table)
// 👉 Lightweight data (only what's needed for listing)
// =====================================================

// ─────────────────────────────────────────────
// 1️⃣ List Subjects Response
// ─────────────────────────────────────────────
export interface SubjectListItem {
  id: string;
  subjectType: string;
  displayName: string;
  businessName: string;
  phone: string;
  email: string;
  gstin?: string | null;
  assignedTeam: {
    primaryAssignee: {
      userId: string;
      name: string;
    };
  } | null;                    // ✅ object, not string
  isActive: boolean;
  activeCompliances: string[];
}


export interface UpcomingItem {
  taskId: string;
  title: string;
  dueDate: string;
  status: string;
  type?: string;
}

//3. GET BY ID (Details Page)
// =====================================================
// 📄 GET SUBJECT DETAILS (View Page)
// 👉 Used when opening client details page
// 👉 Full detailed data
// =====================================================
// ─────────────────────────────────────────────
// 2️⃣ Get Subject by ID Response
// ─────────────────────────────────────────────
export interface Subject {
  id: string;
  businessId: string;
  subjectType: SubjectType;
  profile: SubjectProfile;
  // ✅ ADD THIS
  upcoming?: UpcomingItem[];
  identifiers?: SubjectIdentifiers;
  gst?: SubjectGst;
  primaryContact: PrimaryContact;
  contacts?: SubjectContact[];
  addresses?: SubjectAddress[];
  notificationPreferences?: NotificationPreferences;
  assignedTeam?: AssignedTeam;
  notes?: SubjectNote[];
  metadata?: SubjectMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// ➕ CREATE SUBJECT (POST API)
// 👉 Used when creating a new client
// 👉 Sent from form to backend
// =====================================================

// ─────────────────────────────────────────────
// 3️⃣ Create Subject Request ✅ Single declaration
// ─────────────────────────────────────────────
export interface CreateSubjectDto {
  subjectType: SubjectType;
  profile: {
    displayName: string;
    legalName: string;
    businessName: string;
    constitution: string;
    industry: string;
    businessNature: string[];
  };
  identifiers?: SubjectIdentifiers;
  gst?: {
    gstins: GstEntry[];
  };
  primaryContact: PrimaryContact;
  contacts: SubjectContact[];
  addresses?: SubjectAddress[];
  notificationPreferences?: NotificationPreferences;
  assignedTeam?: AssignedTeam;       // ✅ was missing from CreateSubjectDto
  metadata?: SubjectMetadata;
  notes?: SubjectNote[];
  isActive: boolean;
}
/* export interface AssignedTeam {
  primaryAssignee: AssignedTeamMember; // { userId: string; name: string }
} */

  

//✏️ 5. UPDATE API
// =====================================================
// ✏️ UPDATE SUBJECT (PUT/PATCH API)
// 👉 Used when editing a client
// 👉 All fields are optional (partial update)
// =====================================================


// ─────────────────────────────────────────────
// 4️⃣ Update Subject Request
// ─────────────────────────────────────────────
export interface UpdateSubjectDto {
  profile?: SubjectProfile;
  identifiers?: SubjectIdentifiers;
  gst?: SubjectGst;
  primaryContact?: PrimaryContact;
  contacts?: SubjectContact[];
  addresses?: SubjectAddress[];
  notificationPreferences?: NotificationPreferences;
  // In types/subject.ts — make assignedTeam optional in FormData:
/* assignedTeam?: {
  primaryAssigneeId: string;
  primaryAssigneeName: string;
  }; */
  assignedTeam?: AssignedTeam;
  notes?: SubjectNote[];
  metadata?: SubjectMetadata;
  isActive?: boolean;
}

// ─────────────────────────────────────────────
// 5️⃣ Upcoming Deadlines Response
// ─────────────────────────────────────────────
export interface UpcomingDeadlineRow {
  taskType: string;
  label: string;
  dueDate: string | null;
  daysLeft: number | null;
  status: TaskStatus;
  openTaskCount: number;
  taskId: string | null;
  rowAction: RowAction;
  actions: string[];
}

export interface UpcomingDeadlinesResponse {
  rows: UpcomingDeadlineRow[];
}

// ─────────────────────────────────────────────
// Client Dialog Types
// ─────────────────────────────────────────────
export interface GstinEntry {
  gstin: string;
  state: string;
  registrationType: 'REGULAR' | 'COMPOSITION' | 'EXEMPTED';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ContactEntry {
  name: string;
  role: ContactRole;
  phone: string;
  email: string;
  isPrimary: boolean;
}

/* export interface AddressEntry {
  type: AddressType;
  line1: string;
  city: string;
  state: string;
  pincode: string;
} */
export interface AddressEntry {
  type: AddressType;

  line1: string;
  city: string;
  state: string;
  pincode: string;

  country?: string;
   locality?: string;  // ← ADD THIS
  isActive?: boolean;
}

// ─────────────────────────────────────────────
// Form Data Types
// ─────────────────────────────────────────────
export interface FormData {
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
  complianceGst:  ComplianceService;
  complianceTds:  ComplianceService;
  complianceItr:  ComplianceService;
  complianceRoc:  ComplianceService;
  complianceMsme: ComplianceService;
  tags: string[];
  tagInput: string;
  notes: string;
  assignedTeam: {
    primaryAssigneeId: string;
    primaryAssigneeName: string;   // ✅ added so name is stored at selection time
    // ✅ ADD THIS
  
  };
  isActive: boolean;
}

export interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  pan?: string;
  gstins?: string[];
  contacts?: string[];
}

// ─────────────────────────────────────────────
// Filter Types
// ─────────────────────────────────────────────
export type StatusFilter     = 'ALL' | 'ACTIVE' | 'INACTIVE';
export type GstinFilter      = 'ALL' | 'WITH_GST' | 'WITHOUT_GST';
export type ComplianceFilter = 'ALL' | 'GST' | 'ITR' | 'ROC' | 'TDS' | 'MSME';