"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2, Zap, Crown } from "lucide-react";
import { PlanType } from "@/types";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";

interface PlanSelectionCardsProps {
  checkoutLoading: string | null;
  onSubscribe: (planType: PlanType.BASIC | PlanType.PRO) => Promise<void>;
}

export function PlanSelectionCards({
  checkoutLoading,
  onSubscribe,
}: PlanSelectionCardsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
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
  );
}
