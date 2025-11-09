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

interface PlanCardsProps {
  currentPlan: PlanType;
  credits: number;
  checkoutLoading: string | null;
  onSubscribe: (planType: PlanType.BASIC | PlanType.PRO) => Promise<void>;
  onManageBilling: () => Promise<void>;
}

export function PlanCards({
  currentPlan,
  credits,
  checkoutLoading,
  onSubscribe,
  onManageBilling,
}: PlanCardsProps) {
  const [confirmUpgrade, setConfirmUpgrade] = useState<{
    planType: PlanType.BASIC | PlanType.PRO;
    open: boolean;
  } | null>(null);

  const handleUpgradeClick = (planType: PlanType.BASIC | PlanType.PRO) => {
    // Only show confirmation modal for upgrades (not first-time purchases)
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
          {/* Basic Plan Card */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Basic Plan
              </CardTitle>
              <CardDescription>
                $10/month - Perfect for getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4">
              <div className="text-2xl font-bold">
                $10<span className="text-sm font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-sm flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  10,000 credits per month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {(10000 / CREDITS_PER_SCRAPE).toFixed(0)} resume extractions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Cancel anytime
                </li>
              </ul>
              <div className="mt-auto">
                <Button
                  className="w-full"
                  disabled={checkoutLoading === PlanType.BASIC}
                  onClick={() => handleUpgradeClick(PlanType.BASIC)}
                >
                  {checkoutLoading === PlanType.BASIC ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Subscribe to Basic"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan Card */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Pro Plan
              </CardTitle>
              <CardDescription>$20/month - For power users</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4">
              <div className="text-2xl font-bold">
                $20<span className="text-sm font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-sm flex-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  20,000 credits per month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {(20000 / CREDITS_PER_SCRAPE).toFixed(0)} resume extractions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Advanced features
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Cancel anytime
                </li>
              </ul>
              <div className="mt-auto">
                <Button
                  className="w-full"
                  disabled={checkoutLoading === PlanType.PRO}
                  onClick={() => handleUpgradeClick(PlanType.PRO)}
                >
                  {checkoutLoading === PlanType.PRO ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Subscribe to Pro"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : currentPlan === PlanType.BASIC ? (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Basic Plan
              </CardTitle>
              <Badge>Current</Badge>
            </div>
            <CardDescription>$10/month - Your current plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">
              $10<span className="text-sm font-normal">/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                10,000 credits per month
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {(10000 / CREDITS_PER_SCRAPE).toFixed(0)} resume extractions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Cancel anytime
              </li>
            </ul>
            <div className="space-y-2">
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={checkoutLoading === PlanType.PRO}
                onClick={() => handleUpgradeClick(PlanType.PRO)}
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
                className="w-full"
                variant="outline"
                onClick={onManageBilling}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Pro Plan
              </CardTitle>
              <Badge>Current</Badge>
            </div>
            <CardDescription>$20/month - Your premium plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">
              $20<span className="text-sm font-normal">/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                20,000 credits per month
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {(20000 / CREDITS_PER_SCRAPE).toFixed(0)} resume extractions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Premium support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Advanced AI features
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Cancel anytime
              </li>
            </ul>
            <Button
              className="w-full"
              variant="outline"
              onClick={onManageBilling}
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
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
                // BASIC to PRO upgrade
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
