"use client";

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
  CheckCircle,
  Loader2,
  ArrowUpCircle,
  Settings,
  Zap,
  Crown,
  CreditCard,
} from "lucide-react";
import { PlanType } from "@/types";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";

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
  return (
    <div className="space-y-6">
      {/* Current Plan & Credits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan & Credits
          </CardTitle>
          <CardDescription>
            Manage your subscription and credit balance
          </CardDescription>
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

      {/* Plan Selection/Management Cards */}
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
                  onClick={() => onSubscribe(PlanType.BASIC)}
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
                  onClick={() => onSubscribe(PlanType.PRO)}
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
        <Card className="max-w-md mx-auto">
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
                onClick={() => onSubscribe(PlanType.PRO)}
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
        <Card className="max-w-md mx-auto">
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
    </div>
  );
}
