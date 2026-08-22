// ─────────────────────────────────────────────
// Subject Type Options
// ─────────────────────────────────────────────
export const SUBJECT_TYPE_OPTIONS = [
  { value: 'CLIENT', label: 'Client', color: '#2563eb' },
  { value: 'VENDOR', label: 'Vendor', color: '#7c3aed' },
  { value: 'EMPLOYEE', label: 'Employee', color: '#10b981' },
] as const;

// ─────────────────────────────────────────────
// Contact Role Options
// ─────────────────────────────────────────────
export const CONTACT_ROLE_OPTIONS = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'OTHER', label: 'Other' },
] as const;

// ─────────────────────────────────────────────
// Address Type Options
// ─────────────────────────────────────────────
export const ADDRESS_TYPE_OPTIONS = [
  { value: 'REGISTERED', label: 'Registered Office' },
  { value: 'BUSINESS', label: 'Business Address' },
  { value: 'BILLING', label: 'Billing Address' },
  { value: 'SHIPPING', label: 'Shipping Address' },
] as const;

// ─────────────────────────────────────────────
// GST Registration Type Options
// ─────────────────────────────────────────────
export const GST_REGISTRATION_TYPE_OPTIONS = [
  { value: 'REGULAR', label: 'Regular' },
  { value: 'COMPOSITION', label: 'Composition' },
  { value: 'CASUAL', label: 'Casual' },
  { value: 'SEZ', label: 'SEZ' },
] as const;

// ─────────────────────────────────────────────
// GST Status Options
// ─────────────────────────────────────────────
export const GST_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: '#10b981' },
  { value: 'INACTIVE', label: 'Inactive', color: '#64748b' },
  { value: 'SUSPENDED', label: 'Suspended', color: '#f59e0b' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#dc2626' },
] as const;

// ─────────────────────────────────────────────
// Constitution Options
// ─────────────────────────────────────────────
export const CONSTITUTION_OPTIONS = [
  { value: 'PROPRIETORSHIP', label: 'Proprietorship' },
  { value: 'PARTNERSHIP', label: 'Partnership' },
  { value: 'LLP', label: 'Limited Liability Partnership (LLP)' },
  { value: 'PRIVATE_LIMITED', label: 'Private Limited Company' },
  { value: 'PUBLIC_LIMITED', label: 'Public Limited Company' },
  { value: 'OPC', label: 'One Person Company (OPC)' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'SOCIETY', label: 'Society' },
  { value: 'HUF', label: 'Hindu Undivided Family (HUF)' },
] as const;

// ─────────────────────────────────────────────
// Indian States
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
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

// ─────────────────────────────────────────────
// Industry Options
// ─────────────────────────────────────────────
export const INDUSTRY_OPTIONS = [
  'Manufacturing',
  'Trading',
  'Services',
  'IT/Software',
  'Healthcare',
  'Education',
  'Construction',
  'Real Estate',
  'Hospitality',
  'Retail',
  'Agriculture',
  'Finance',
  'Other',
] as const;

// ─────────────────────────────────────────────
// Filter Options
// ─────────────────────────────────────────────
export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export const SUBJECT_TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 'CLIENT', label: 'Clients' },
  { value: 'VENDOR', label: 'Vendors' },
  { value: 'EMPLOYEE', label: 'Employees' },
] as const;

export type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
export type SubjectTypeFilter = 'ALL' | 'CLIENT' | 'VENDOR' | 'EMPLOYEE';

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────
export const getSubjectTypeColor = (type: string) => {
  const option = SUBJECT_TYPE_OPTIONS.find((opt) => opt.value === type);
  return option?.color || '#64748b';
};

export const getGSTStatusColor = (status: string) => {
  const option = GST_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || '#64748b';
};