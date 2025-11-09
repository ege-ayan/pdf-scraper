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
} from "lucide-react";
import { PlanType } from "@/types";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";

interface BasicPlanCardProps {
  checkoutLoading: string | null;
  onSubscribe: (planType: PlanType.BASIC | PlanType.PRO) => Promise<void>;
  onManageBilling: () => Promise<void>;
}

export function BasicPlanCard({
  checkoutLoading,
  onSubscribe,
  onManageBilling,
}: BasicPlanCardProps) {
  return (
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
  );
}
