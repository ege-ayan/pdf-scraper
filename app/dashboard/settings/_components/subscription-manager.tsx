"use client";

import { PlanType } from "@/types";
import { useSubscriptionManager } from "../_hooks/use-subscription-manager";
import { PlanCards } from "./plan-cards";
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
    <PlanCards
      currentPlan={currentPlan}
      credits={credits}
      checkoutLoading={checkoutLoading}
      onSubscribe={handleSubscribe}
      onManageBilling={handleManageBilling}
    />
  );
}
