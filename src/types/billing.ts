// ─────────────────────────────────────────────
// Subscription Types
// ─────────────────────────────────────────────
export interface Subscription {
  planKey: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStartAt: string;
  trialEndAt: string;
  isTrialActive: boolean;
  paymentStatus: string;
  razorpaySubscriptionId: string;
}

export interface StartSubscriptionDto {
  planKey: string;
  billingInterval: string;
  trial: boolean;
}

export interface CancelSubscriptionDto {
  reason: string;
}

export interface ReactivateSubscriptionResponse {
  subscriptionId: string;
  status: string;
  message: string;
}

export interface ConfirmPaymentDto {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  trial: boolean;
  planKey: string;
}

// ─────────────────────────────────────────────
// Plans Types
// ─────────────────────────────────────────────
export interface Plan {
  planKey: string;
  displayName: string;
}

export interface AvailablePlans {
  planKeys: string[];
  billingIntervals: string[];
  plans: Plan[];
  trialPeriodDays: number;
}

// ─────────────────────────────────────────────
// Payment Types
// ─────────────────────────────────────────────
export interface Payment {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
}

export interface PaymentsList {
  items: Payment[];
}

export interface RefundPaymentDto {
  paymentId: string;
  amount: number;
}

// ─────────────────────────────────────────────
// Enums & Constants Types
// ─────────────────────────────────────────────
export type PlanKey = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';
export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'incomplete'
  | 'paused';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface Checkout {
  subscriptionId: string;
  orderId: string;
  paymentLink: string;
  amount: number;
  currency: string;
  status: string;
  trialPeriodDays: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}