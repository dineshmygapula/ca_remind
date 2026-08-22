export interface Organization {
  id: string;
  name: string;
  billingEmail: string;
  planKey: string;
  ownerUserId: string;
  billingMeta: Record<string, unknown>; // ← add this
  createdAt?: string;                    // ← optional until confirmed from API
  updatedAt?: string;                    // ← optional until confirmed from API
}

export interface CreateOrganizationDto {
  name: string;
  billingEmail: string;
  planKey?: string;
  billingMeta?: Record<string, unknown>;
}

export interface UpdateOrganizationDto {
  name?: string;
  billingEmail?: string;
  planKey?: string;
  billingMeta?: Record<string, unknown>;
}

// 1️⃣ POST – Create Organization
export interface CreateOrganizationRequest {
  name: string;
  billingEmail: string;
  planKey: string;
  billingMeta: Record<string, unknown>;
}

// 2️⃣ GET – List Organizations
export interface Organization {
  id: string;
  name: string;
  ownerUserId: string;
  planKey: string;
  billingEmail: string;
  billingMeta: Record<string, unknown>;
}

export type ListOrganizationsResponse = Organization[];

// 3️⃣ GET – Get Organization by ID
export type GetOrganizationByIdResponse = Organization;

// 4️⃣ PATCH – Update Organization (partial fields)
export interface UpdateOrganizationRequest {
  name?: string;
  billingEmail?: string;
  planKey?: string;
  billingMeta?: Record<string, unknown>;
}

// 5️⃣ DELETE – Delete Organization
export interface DeleteOrganizationResponse {
  message: string;
}

// Matches API request body → belongs in types/
export interface BillingMeta {
  gstNumber: string;
  billingAddress: string;
  invoicePreference: string;
}

// Pure form/UI state → okay in component
export interface OrganizationFormData {
  name: string;
  billingEmail: string;

}