"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import { PlanType } from "@/lib/types/enums";

interface UserCredits {
  credits: number;
  planType: PlanType;
}

export default function SubscriptionManager() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Handle success/cancel URLs
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success) {
      // Show success message for subscription updates
      if (userCredits?.planType === PlanType.PRO) {
        toast.success("🎉 Successfully upgraded to Pro! You now have enhanced features and 20,000 credits.", {
          duration: 5000,
        });
      } else if (userCredits?.planType === PlanType.BASIC) {
        toast.success("🎉 Successfully subscribed to Basic plan! You now have 10,000 credits.", {
          duration: 5000,
        });
      } else {
        toast.success("Subscription updated successfully!");
      }
      fetchUserCredits();
      // Remove the query param
      router.replace("/dashboard/settings");
    }

    if (canceled) {
      toast.info("Subscription update canceled");
      router.replace("/dashboard/settings");
    }
  }, [searchParams, router]);

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
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
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

        // Handle specific error cases
        if (response.status === 400 && error.message?.includes("No active subscription")) {
          toast.error("No active subscription found. Please subscribe to a plan first.");
          return;
        }

        throw new Error(error.message || "Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe Customer Portal
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
      {/* Current Plan & Credits */}
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
                {currentPlan === PlanType.FREE && <Badge variant="secondary">Free</Badge>}
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
              <p className="text-2xl font-bold text-primary">{credits.toLocaleString()}</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Each resume extraction costs 100 credits</p>
            <p>• {credits < 100 ? "⚠️" : "✅"} You have enough credits for {(credits / 100).toFixed(0)} more extractions</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      {currentPlan === PlanType.FREE ? (
        // Show both plans for FREE users
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Basic Plan
              </CardTitle>
              <CardDescription>$10/month - Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">$10<span className="text-sm font-normal">/month</span></div>
              <ul className="space-y-2 text-sm">
                <li>✅ 10,000 credits per month</li>
                <li>✅ 100 resume extractions</li>
                <li>✅ Priority support</li>
                <li>✅ Cancel anytime</li>
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

          {/* Pro Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Pro Plan
              </CardTitle>
              <CardDescription>$20/month - For power users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">$20<span className="text-sm font-normal">/month</span></div>
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
        // Show Basic plan with upgrade option to Pro
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Basic Plan */}
          <Card className="ring-2 ring-blue-500">
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
              <div className="text-2xl font-bold">$10<span className="text-sm font-normal">/month</span></div>
              <ul className="space-y-2 text-sm">
                <li>✅ 10,000 credits per month</li>
                <li>✅ 100 resume extractions</li>
                <li>✅ Priority support</li>
                <li>✅ Cancel anytime</li>
              </ul>
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan Upgrade */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Upgrade to Pro
              </CardTitle>
              <CardDescription>$20/month - Unlock advanced features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-purple-600">$20<span className="text-sm font-normal">/month</span></div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Upgrade Benefits:</p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>✅ +10,000 additional credits (20,000 total)</li>
                  <li>✅ +100 more resume extractions</li>
                  <li>✅ Advanced AI features</li>
                  <li>✅ Premium support</li>
                </ul>
              </div>
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
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Show only Pro plan for PRO users
        <Card className="ring-2 ring-purple-500">
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
            <div className="text-2xl font-bold">$20<span className="text-sm font-normal">/month</span></div>
            <ul className="space-y-2 text-sm">
              <li>✅ 20,000 credits per month</li>
              <li>✅ 200 resume extractions</li>
              <li>✅ Priority support</li>
              <li>✅ Advanced features</li>
              <li>✅ Cancel anytime</li>
            </ul>
            <Button className="w-full" variant="outline" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Billing Management */}
      {(currentPlan === PlanType.BASIC || currentPlan === PlanType.PRO) && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Management</CardTitle>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManageBilling} variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing & Subscription
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Update payment methods, view invoices, and cancel subscription
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
