import type { OrganizationFormData, BillingMeta } from "@/types/organizations";

// ── Constants ──────────────────────────────────────────
export const INVOICE_PREFERENCES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly",  label: "Yearly"  },
];

export const EMPTY_FORM: OrganizationFormData = {
  name: "",
  billingEmail: "",
  
};

export const EMPTY_BILLING_META: BillingMeta = {
  gstNumber: "",
  billingAddress: "",
  invoicePreference: "",
};