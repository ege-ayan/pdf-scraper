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
import { CheckCircle, Settings, Crown } from "lucide-react";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";

interface ProPlanCardProps {
  onManageBilling: () => Promise<void>;
}

export function ProPlanCard({ onManageBilling }: ProPlanCardProps) {
  return (
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
  );
}
