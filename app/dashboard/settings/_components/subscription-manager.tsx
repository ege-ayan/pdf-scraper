"use client";

import { PlanType } from "@/types";
import { useSubscriptionManager } from "../_hooks/use-subscription-manager";
import { CurrentPlanCard } from "./current-plan-card";
import { PlanSelectionCards } from "./plan-selection-cards";
import { BasicPlanCard } from "./basic-plan-card";
import { ProPlanCard } from "./pro-plan-card";
import { SubscriptionLoading } from "./subscription-loading";

interface SubscriptionManagerProps {
  success?: string;
  canceled?: string;
}

export default function SubscriptionManager({
  success,
  canceled,
}: SubscriptionManagerProps) {
  const {
    userCredits,
    loading,
    checkoutLoading,
    handleSubscribe,
    handleManageBilling,
  } = useSubscriptionManager({ success, canceled });

  if (loading) {
    return <SubscriptionLoading />;
  }

  const currentPlan = userCredits?.planType || PlanType.FREE;
  const credits = userCredits?.credits || 0;

  return (
    <div className="space-y-6">
      <CurrentPlanCard credits={credits} planType={currentPlan} />

      {currentPlan === PlanType.FREE ? (
        <PlanSelectionCards
          checkoutLoading={checkoutLoading}
          onSubscribe={handleSubscribe}
        />
      ) : currentPlan === PlanType.BASIC ? (
        <BasicPlanCard
          checkoutLoading={checkoutLoading}
          onSubscribe={handleSubscribe}
          onManageBilling={handleManageBilling}
        />
      ) : (
        <ProPlanCard onManageBilling={handleManageBilling} />
      )}
    </div>
  );
}
