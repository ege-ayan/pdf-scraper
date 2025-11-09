"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, Crown } from "lucide-react";
import { PlanType } from "@/types";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";

interface CurrentPlanCardProps {
  credits: number;
  planType: PlanType;
}

export function CurrentPlanCard({ credits, planType }: CurrentPlanCardProps) {
  return (
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
              {planType === PlanType.FREE && (
                <Badge variant="secondary">Free</Badge>
              )}
              {planType === PlanType.BASIC && (
                <Badge variant="default" className="bg-blue-500">
                  <Zap className="h-3 w-3 mr-1" />
                  Basic
                </Badge>
              )}
              {planType === PlanType.PRO && (
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
