"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Loader2,
  ArrowUpCircle,
  Settings,
  Zap,
  Crown,
} from "lucide-react";
import { PlanType } from "@/types";
import { CREDITS_PER_SCRAPE, PLAN_CREDITS } from "@/lib/constants";

interface PlanCardProps {
  planType: PlanType;
  isCurrentPlan?: boolean;
  isCompact?: boolean; // For side-by-side layout
  checkoutLoading: string | null;
  onSubscribe?: (planType: PlanType) => void;
  onUpgrade?: (planType: PlanType) => void;
  onManageBilling?: () => void;
}

function PlanCard({
  planType,
  isCurrentPlan = false,
  isCompact = false,
  checkoutLoading,
  onSubscribe,
  onUpgrade,
  onManageBilling,
}: PlanCardProps) {
  const getPlanDetails = (plan: PlanType) => {
    switch (plan) {
      case PlanType.BASIC:
        return {
          name: "Basic Plan",
          icon: Zap,
          iconColor: "text-blue-500",
          price: 10,
          credits: 10000,
          description: isCurrentPlan
            ? "$10/month - Your current plan"
            : "$10/month - Perfect for getting started",
        };
      case PlanType.PRO:
        return {
          name: "Pro Plan",
          icon: Crown,
          iconColor: "text-purple-500",
          price: 20,
          credits: 20000,
          description: isCurrentPlan
            ? "$20/month - Your premium plan"
            : planType === PlanType.PRO && !isCurrentPlan
            ? "$20/month - For power users"
            : "$20/month - Unlock premium features",
        };
      default:
        return null;
    }
  };

  const planDetails = getPlanDetails(planType);
  if (!planDetails) return null;

  const {
    name,
    icon: Icon,
    iconColor,
    price,
    credits,
    description,
  } = planDetails;

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade(planType);
    } else if (onSubscribe) {
      onSubscribe(planType);
    }
  };

  return (
    <Card className={isCompact ? "flex flex-col h-full" : "w-full"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {name}
          </CardTitle>
          {isCurrentPlan && <Badge>Current</Badge>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent
        className={isCompact ? "flex flex-col flex-1 space-y-4" : "space-y-4"}
      >
        <div className="text-2xl font-bold">
          ${price}
          <span className="text-sm font-normal">/month</span>
        </div>
        <ul
          className={
            isCompact ? "space-y-2 text-sm flex-1" : "space-y-2 text-sm"
          }
        >
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {credits.toLocaleString()} credits per month
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {(credits / CREDITS_PER_SCRAPE).toFixed(0)} resume extractions
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Cancel anytime
          </li>
        </ul>
        <div className={isCompact ? "mt-auto" : "space-y-2"}>
          {isCurrentPlan ? (
            // Current plan - show upgrade/manage buttons
            planType === PlanType.BASIC ? (
              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <Button
                  className="w-full md:w-1/2 bg-purple-600 hover:bg-purple-700"
                  disabled={checkoutLoading === PlanType.PRO}
                  onClick={handleUpgradeClick}
                >
                  {checkoutLoading === PlanType.PRO ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>
                <Button
                  className="w-full md:w-1/2"
                  variant="outline"
                  onClick={onManageBilling}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              </div>
            ) : (
              // Pro plan current
              <div className="flex justify-center">
                <Button
                  className="w-full md:w-auto"
                  variant="outline"
                  onClick={onManageBilling}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              </div>
            )
          ) : (
            // Not current plan - show subscribe button
            <div className="flex justify-center">
              <Button
                className={`w-full md:w-auto ${
                  planType === PlanType.PRO
                    ? "bg-purple-600 hover:bg-purple-700"
                    : ""
                }`}
                disabled={checkoutLoading === planType}
                onClick={handleUpgradeClick}
              >
                {checkoutLoading === planType ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Subscribe to ${planType === PlanType.PRO ? "Pro" : "Basic"}`
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PlanCardsProps {
  currentPlan: PlanType;
  credits: number;
  checkoutLoading: string | null;
  onSubscribe: (planType: PlanType) => void;
  onManageBilling: () => void;
}

export function PlanCards({
  currentPlan,
  credits,
  checkoutLoading,
  onSubscribe,
  onManageBilling,
}: PlanCardsProps) {
  const [confirmUpgrade, setConfirmUpgrade] = useState<{
    planType: PlanType;
    open: boolean;
  } | null>(null);

  const handleUpgradeClick = (planType: PlanType) => {
    if (currentPlan === PlanType.FREE) {
      onSubscribe(planType);
    } else {
      setConfirmUpgrade({ planType, open: true });
    }
  };

  const handleConfirmUpgrade = async () => {
    if (confirmUpgrade) {
      await onSubscribe(confirmUpgrade.planType);
      setConfirmUpgrade(null);
    }
  };

  return (
    <div className="space-y-6">
      {currentPlan === PlanType.FREE ? (
        <div className="grid md:grid-cols-2 gap-6">
          <PlanCard
            planType={PlanType.BASIC}
            isCompact={true}
            checkoutLoading={checkoutLoading}
            onSubscribe={handleUpgradeClick}
          />
          <PlanCard
            planType={PlanType.PRO}
            isCompact={true}
            checkoutLoading={checkoutLoading}
            onSubscribe={handleUpgradeClick}
          />
        </div>
      ) : currentPlan === PlanType.BASIC ? (
        <PlanCard
          planType={PlanType.BASIC}
          isCurrentPlan={true}
          checkoutLoading={checkoutLoading}
          onUpgrade={handleUpgradeClick}
          onManageBilling={onManageBilling}
        />
      ) : (
        <PlanCard
          planType={PlanType.PRO}
          isCurrentPlan={true}
          checkoutLoading={checkoutLoading}
          onManageBilling={onManageBilling}
        />
      )}

      {/* Upgrade Confirmation Modal */}
      <Dialog
        open={confirmUpgrade?.open}
        onOpenChange={(open) => setConfirmUpgrade(open ? confirmUpgrade : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Upgrade</DialogTitle>
            <div className="text-muted-foreground text-sm space-y-4">
              {currentPlan === PlanType.FREE ? (
                // FREE to BASIC/PRO subscription
                confirmUpgrade?.planType === PlanType.PRO ? (
                  <>
                    <p>You're about to subscribe to the Pro plan.</p>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>Credits included:</span>
                        <span className="font-bold text-primary">
                          {PLAN_CREDITS.PRO.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p>You'll be charged $20/month starting today.</p>
                  </>
                ) : (
                  <>
                    <p>You're about to subscribe to the Basic plan.</p>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span>Credits included:</span>
                        <span className="font-bold text-primary">
                          {PLAN_CREDITS.BASIC.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p>You'll be charged $10/month starting today.</p>
                  </>
                )
              ) : (
                <>
                  <p>You're about to upgrade from Basic to Pro plan.</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span>Current credits:</span>
                      <span className="font-semibold">
                        {credits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>+ Pro plan credits:</span>
                      <span className="font-semibold text-green-600">
                        +{PLAN_CREDITS.PRO.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-semibold">New total:</span>
                      <span className="font-bold text-primary">
                        {(credits + PLAN_CREDITS.PRO).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p>
                    Your subscription will be updated immediately and you'll be
                    charged the prorated difference.
                  </p>
                </>
              )}
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmUpgrade(null)}
              disabled={checkoutLoading === confirmUpgrade?.planType}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={checkoutLoading === confirmUpgrade?.planType}
            >
              {checkoutLoading === confirmUpgrade?.planType ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : confirmUpgrade?.planType === PlanType.PRO ? (
                "Upgrade to Pro"
              ) : (
                "Subscribe to Basic"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
