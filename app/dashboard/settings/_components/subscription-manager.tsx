"use client";

import { PlanType } from "@/types";
import { useSubscriptionManager } from "../_hooks/use-subscription-manager";
import { PlanCards } from "./plan-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Crown } from "lucide-react";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface SubscriptionManagerProps {
  success?: string;
  canceled?: string;
}

function CurrentPlanDisplay({
  currentPlan,
  credits,
}: {
  currentPlan: PlanType;
  credits: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Current Plan & Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current Plan</p>
            <div className="flex items-center gap-2 mt-1">
              {currentPlan === PlanType.FREE && (
                <Badge variant="secondary">Free</Badge>
              )}
              {currentPlan === PlanType.BASIC && (
                <Badge variant="default" className="bg-blue-500">
                  <Zap className="h-3 w-3 mr-1" />
                  Basic
                </Badge>
              )}
              {currentPlan === PlanType.PRO && (
                <Badge variant="default" className="bg-purple-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Available Credits</p>
            <p className="text-2xl font-bold text-primary">
              {credits.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• Each resume extraction costs {CREDITS_PER_SCRAPE} credits</p>
          <p>
            • You have enough credits for{" "}
            <span className="font-bold">
              {(credits / CREDITS_PER_SCRAPE).toFixed(0)}
            </span>{" "}
            more extractions
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionLoading() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading subscription details...</span>
      </CardContent>
    </Card>
  );
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
      <CurrentPlanDisplay currentPlan={currentPlan} credits={credits} />

      <PlanCards
        currentPlan={currentPlan}
        credits={credits}
        checkoutLoading={checkoutLoading}
        onSubscribe={handleSubscribe}
        onManageBilling={handleManageBilling}
      />
    </div>
  );
}
