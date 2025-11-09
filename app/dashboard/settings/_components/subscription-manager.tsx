"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PlanType } from "@/types";
import { useSubscriptionManager } from "../_hooks/use-subscription-manager";
import { PlanCards } from "./plan-cards";

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
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading subscription details...</span>
        </CardContent>
      </Card>
    );
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
