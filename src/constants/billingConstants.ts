// ─────────────────────────────────────────────
// Plan Options
// ─────────────────────────────────────────────
export const PLAN_OPTIONS = [
  { value: 'free', label: 'Free Plan', color: '#64748b' },
  { value: 'pro', label: 'Pro Plan', color: '#2563eb' },
  { value: 'enterprise', label: 'Enterprise Plan', color: '#7c3aed' },
] as const;

// ─────────────────────────────────────────────
// Billing Interval Options
// ─────────────────────────────────────────────
export const BILLING_INTERVAL_OPTIONS = [
  { value: 'monthly', label: 'Monthly', discount: 0 },
  { value: 'yearly', label: 'Yearly', discount: 20 }, // 20% discount
] as const;

// ─────────────────────────────────────────────
// Subscription Status Options
// ─────────────────────────────────────────────
export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: '#16a34a' },
  { value: 'trialing', label: 'Trial', color: '#2563eb' },
  { value: 'past_due', label: 'Past Due', color: '#f59e0b' },
  { value: 'canceled', label: 'Canceled', color: '#dc2626' },
  { value: 'unpaid', label: 'Unpaid', color: '#dc2626' },
  { value: 'incomplete', label: 'Incomplete', color: '#64748b' },
  { value: 'paused', label: 'Paused', color: '#64748b' },
] as const;

// ─────────────────────────────────────────────
// Payment Status Options
// ─────────────────────────────────────────────
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid', color: '#16a34a' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'failed', label: 'Failed', color: '#dc2626' },
  { value: 'refunded', label: 'Refunded', color: '#64748b' },
] as const;

// ─────────────────────────────────────────────
// Cancellation Reasons
// ─────────────────────────────────────────────
export const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'missing_features', label: 'Missing features' },
  { value: 'switching_service', label: 'Switching to another service' },
  { value: 'not_using', label: 'Not using the service' },
  { value: 'technical_issues', label: 'Technical issues' },
  { value: 'poor_support', label: 'Poor customer support' },
  { value: 'other', label: 'Other' },
] as const;

// ─────────────────────────────────────────────
// Currency Options
// ─────────────────────────────────────────────
export const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ INR', symbol: '₹' },
  { value: 'USD', label: '$ USD', symbol: '$' },
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'GBP', label: '£ GBP', symbol: '£' },
] as const;

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────
export const getSubscriptionStatusColor = (status: string) => {
  const option = SUBSCRIPTION_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || '#64748b';
};

export const getPaymentStatusColor = (status: string) => {
  const option = PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || '#64748b';
};

export const getPlanColor = (planKey: string) => {
  const option = PLAN_OPTIONS.find((opt) => opt.value === planKey);
  return option?.color || '#64748b';
};

export const formatCurrency = (amount: number, currency: string = 'INR') => {
  const currencyOption = CURRENCY_OPTIONS.find((opt) => opt.value === currency);
  const symbol = currencyOption?.symbol || '₹';
  return `${symbol}${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};