// ─── Business Settings ────────────────────────────────
export interface BusinessUiConfig {
  primarySubjectType?: string;
  primarySubjectLabel?: { singular: string; plural: string };
  ownerName?: string;
  email?: string;
}

export interface BusinessSettings {
  id: string;
  timezone: string;
  locale: string;
  uiConfig?: BusinessUiConfig;
}

// ─── Address ─────────────────────────────────────────
export interface BusinessAddress {
  type: "REGISTERED" | "COMMUNICATION";
  line1?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

// ─── Allowed Business Types ───────────────────────────
export type BusinessType =
  | 'ACCOUNTS'
  | 'RETAIL'
  | 'WHOLESALE'
  | 'SERVICE'
  | 'OTHER';

// ─── Core Business Entity ─────────────────────────────
export interface Business {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  phone: string;
  businessType: BusinessType;
  primarySubjectId: string | null;
  isActive: boolean;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  settings: BusinessSettings;
  // optional fields from API
  address?: BusinessAddress;
  ownerName?: string;
  email?: string;
}

// ─── Create Business DTO ──────────────────────────────
export interface CreateBusinessDto {
  name: string;
  phone: string;
  businessType: string;
  address?: BusinessAddress;
  timezone: string;
  locale: string;
  uiConfig?: Record<string, unknown>;
}

// ─── Update Business DTO ──────────────────────────────
export interface UpdateBusinessDto {
  name?: string;
  phone?: string;
  businessType?: string;
  tags?: string[];
  notes?: string;
  isActive?: boolean;
  address?: BusinessAddress;
  ownerName?: string;        // ✅ for form state only
  email?: string;            // ✅ for form state only
  uiConfig?: {               // ✅ sent to API inside settings
    ownerName?: string;
    email?: string;
  }; 
}

// ─── Form State ───────────────────────────────────────
export interface BusinessFormData {
  name: string;
  phone: string;
  businessType: string;
  businessTimeZone?: string;
  locale: string;
  ownerName?: string;
  email?: string;
  address?: BusinessAddress;
}

export type BusinessProfile = Business;

// ─── Response Types ───────────────────────────────────
export type ListBusinessesResponse = Business[];
export type GetBusinessByIdResponse = Business;
export interface DeleteBusinessResponse {
  message: string;
}