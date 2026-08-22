'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { startSubscription, confirmPayment } from '@/services/billingService';
import { useSubscription } from '@/context/SubscriptionContext';

// ── Pricing ──────────────────────────────────────────────
const PLAN_PRICING: Record<string, Record<string, { price: number; originalPrice: number | null; description: string }>> = {
  free: {
    monthly: { price: 0, originalPrice: null, description: 'Try features before subscribing' },
  },
  pro: {
    monthly: { price: 199, originalPrice: 359, description: "Full access for your organization\nMonthly billing" },
    yearly: { price: 2199, originalPrice: 4398, description: "Full access for your organization\nYearly billing" },
  },
  premium: {
    monthly: { price: 299, originalPrice: 499, description: 'Premium features\nMonthly billing' },
    yearly: { price: 2999, originalPrice: 5998, description: 'Premium features\nYearly billing' },
  },
  enterprise: {
    monthly: { price: -1, originalPrice: null, description: 'Tailored pricing and onboarding for larger teams.' },
    yearly: { price: -1, originalPrice: null, description: 'Tailored pricing and onboarding for larger teams.' },
  },
};

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free trial',
  pro: 'Pro',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

// ── Razorpay types ───────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ── Props ────────────────────────────────────────────────
interface PlanCardProps {
  planKey: string;
  billingInterval: string;
  trialPeriodDays: number;
  organizationId: string;
  onStarted: () => void;
}

export default function PlanCard({
  planKey,
  billingInterval,
  trialPeriodDays,
  organizationId,
  onStarted,
}: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { refresh } = useSubscription();
  const router = useRouter();

  const pricing = PLAN_PRICING[planKey]?.[billingInterval];
  if (!pricing) return null;

  const isFree = planKey === 'free';
  const isEnterprise = pricing.price === -1;
  const intervalLabel = billingInterval === 'yearly' ? 'per year' : 'per month';
  const displayName = PLAN_DISPLAY_NAMES[planKey] ?? planKey;
  const title = isFree
    ? displayName
    : `${displayName} · ${billingInterval.charAt(0).toUpperCase() + billingInterval.slice(1)}`;

  // ── Load Razorpay script ─────────────────────────────────
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ── Handle paid plan ─────────────────────────────────────
  const handlePaidPlan = async () => {
    const checkout = await startSubscription(organizationId, {
      planKey,
      billingInterval,
      trial: false,
    });

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay. Please check your connection.');
    }

    return new Promise<void>((resolve, reject) => {
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: checkout.amount,
        currency: checkout.currency,
        name: 'RemindCA',
        description: `${displayName} Plan`,
        order_id: checkout.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            await confirmPayment(organizationId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              trial: false,
              planKey,
            });
            await refresh();
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        theme: { color: '#1B2A4A' },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  // ── Main handler ─────────────────────────────────────────
  const handleSelect = async () => {
    if (isEnterprise) return; // TODO: contact sales
    try {
      setLoading(true);
      setError('');

      if (isFree) {
        await startSubscription(organizationId, {
          planKey: 'pro',
          billingInterval: 'monthly',
          trial: true,
        });
        await refresh();
        onStarted();
      } else {
        await handlePaidPlan();
        onStarted();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      if (message !== 'Payment cancelled') {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-divider bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
      <div>
        {/* Plan title */}
        <h3 className="mb-1 text-lg font-bold text-navy">{title}</h3>

        {/* Price row */}
        {!isEnterprise && (
          <div className="mb-1 flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-txt-main">
              {isFree ? '₹ 0' : `INR ${pricing.price.toLocaleString('en-IN')}`}
            </span>
            {pricing.originalPrice && (
              <span className="text-sm text-txt-sub line-through opacity-70">
                INR {pricing.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {!isFree && <span className="text-sm text-txt-sub">{intervalLabel}</span>}
          </div>
        )}

        {/* Description */}
        <p className="whitespace-pre-line text-sm leading-relaxed text-txt-sub">
          {pricing.description}
        </p>

        {/* Trial days label */}
        {isFree && trialPeriodDays > 0 && (
          <p className="mt-1 text-sm text-txt-sub">{trialPeriodDays}-day free trial</p>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error mt-3 py-2 text-sm">
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Action button pinned to bottom */}
      <button
        onClick={handleSelect}
        disabled={loading}
        className="btn btn-outline mt-6 w-full rounded-xl border-2 border-navy py-3 text-base font-bold normal-case text-navy hover:border-navy-hover hover:bg-navy hover:text-white disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin text-navy" />
        ) : isFree ? (
          'Start trial'
        ) : isEnterprise ? (
          'Contact sales'
        ) : (
          'Select'
        )}
      </button>
    </div>
  );
}