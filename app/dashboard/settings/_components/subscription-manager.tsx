"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Loader2,
  CreditCard,
  Zap,
  Crown,
  CheckCircle,
  ArrowUpCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { PlanType } from "@/lib/types/enums";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";

interface UserCredits {
  credits: number;
  planType: PlanType;
}

interface SubscriptionManagerProps {
  success?: string;
  canceled?: string;
}

export default function SubscriptionManager({
  success,
  canceled,
}: SubscriptionManagerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      if (userCredits?.planType === PlanType.PRO) {
        toast.success(
          "🎉 Successfully upgraded to Pro! You now have enhanced features and 20,000 credits.",
          {
            duration: 5000,
          }
        );
      } else if (userCredits?.planType === PlanType.BASIC) {
        toast.success(
          "🎉 Successfully subscribed to Basic plan! You now have 10,000 credits.",
          {
            duration: 5000,
          }
        );
      } else {
        toast.success("Subscription updated successfully!");
      }
      fetchUserCredits();
      router.replace("/dashboard/settings");
    }

    if (canceled) {
      toast.info("Subscription update canceled");
      router.replace("/dashboard/settings");
    }
  }, [success, canceled, userCredits?.planType, router]);

  const fetchUserCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data);
      }
    } catch (error) {
      console.error("Failed to fetch user credits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const handleSubscribe = async (planType: PlanType.BASIC | PlanType.PRO) => {
    if (!session?.user?.id) return;

    setCheckoutLoading(planType);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout"
      );
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();

        if (
          response.status === 400 &&
          error.message?.includes("No active subscription")
        ) {
          toast.error(
            "No active subscription found. Please subscribe to a plan first."
          );
          return;
        }

        throw new Error(error.message || "Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error("Portal error:", error);
      toast.error(error.message || "Failed to open billing portal");
    }
  };

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
    <div className="space-y-6">
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
              • {credits < CREDITS_PER_SCRAPE ? "⚠️" : "✅"} You have enough
              credits for {(credits / CREDITS_PER_SCRAPE).toFixed(0)} more
              extractions
            </p>
          </div>
        </CardContent>
      </Card>

      {currentPlan === PlanType.FREE ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Basic Plan
              </CardTitle>
              <CardDescription>
                $10/month - Perfect for getting started
              </CardDescription>
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
              <Button
                className="w-full"
                disabled={checkoutLoading === PlanType.BASIC}
                onClick={() => handleSubscribe(PlanType.BASIC)}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Pro Plan
              </CardTitle>
              <CardDescription>$20/month - For power users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                $20<span className="text-sm font-normal">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✅ 20,000 credits per month</li>
                <li>✅ 200 resume extractions</li>
                <li>✅ Priority support</li>
                <li>✅ Advanced features</li>
                <li>✅ Cancel anytime</li>
              </ul>
              <Button
                className="w-full"
                disabled={checkoutLoading === PlanType.PRO}
                onClick={() => handleSubscribe(PlanType.PRO)}
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
                onClick={() => handleSubscribe(PlanType.PRO)}
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
                onClick={handleManageBilling}
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
              onClick={handleManageBilling}
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
