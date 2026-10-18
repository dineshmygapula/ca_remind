"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { AvailablePlans } from "@/types/billing";
import PlanCard from "./PlanCard";

interface PlansPageClientProps {
  plans: AvailablePlans;
  organizationId: string;
}

export default function PlansPageClient({
  plans,
  organizationId,
}: PlansPageClientProps) {
  const router = useRouter();

  const handleStarted = () => {
    router.push("/business-create");
  };

  // ── Build card list:
  // - "free" renders only once (no billing interval)
  // - all other plans render once per billing interval
  const cards: { planKey: string; billingInterval: string }[] = [];

  plans.planKeys.forEach((planKey) => {
    if (planKey === "free") {
      cards.push({ planKey, billingInterval: "monthly" }); // only once
    } else {
      plans.billingIntervals.forEach((interval) => {
        cards.push({ planKey, billingInterval: interval });
      });
    }
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-txt-main">
          Choose the right plan
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cards.map(({ planKey, billingInterval }) => (
            <PlanCard
              key={`${planKey}-${billingInterval}`}
              planKey={planKey}
              billingInterval={billingInterval}
              trialPeriodDays={plans.trialPeriodDays}
              organizationId={organizationId}
              onStarted={handleStarted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
