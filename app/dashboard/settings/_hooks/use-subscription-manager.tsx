"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { PlanType } from "@/types";

// Hook for managing user credits state
export function useUserCredits() {
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserCredits = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/user/credits");
      setUserCredits(response.data);
    } catch (error) {
      console.error("Failed to fetch user credits:", error);
      toast.error("Failed to load subscription information");
    } finally {
      setLoading(false);
    }
  };

  const refreshCredits = fetchUserCredits;

  useEffect(() => {
    fetchUserCredits();
  }, []);

  return {
    userCredits,
    loading,
    refreshCredits,
    setUserCredits,
  };
}

// Hook for handling subscription actions
export function useSubscriptionActions() {
  const { data: session } = useSession();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleSubscribe = async (planType: PlanType.BASIC | PlanType.PRO) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to subscribe");
      return;
    }

    setCheckoutLoading(planType);
    try {
      const response = await axios.post("/api/stripe/checkout", {
        planType,
      });

      const { url } = response.data;
      router.push(url);
    } catch (error) {
      console.error("Checkout error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(errorMessage || "Failed to start checkout");
      } else {
        toast.error("Failed to start checkout");
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await axios.post("/api/stripe/portal");

      const { url } = response.data;
      router.push(url);
    } catch (error: any) {
      console.error("Portal error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;

        if (
          status === 400 &&
          errorMessage?.includes("No active subscription")
        ) {
          toast.error(
            "No active subscription found. Please subscribe to a plan first."
          );
          return;
        }

        toast.error(errorMessage || "Failed to open billing portal");
      } else {
        toast.error(error.message || "Failed to open billing portal");
      }
    }
  };

  return {
    checkoutLoading,
    handleSubscribe,
    handleManageBilling,
  };
}

// Hook for handling subscription success/cancel states
export function useSubscriptionSuccess({
  success,
  canceled,
  onCreditsUpdate,
}: {
  success?: string;
  canceled?: string;
  onCreditsUpdate: (credits: UserCredits) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (success) {
      const handleSuccess = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const response = await axios.get("/api/user/credits");
          const freshCredits = response.data;

          if (freshCredits?.planType === PlanType.PRO) {
            toast.success(
              `🎉 Successfully upgraded to Pro! You now have ${freshCredits.credits.toLocaleString()} credits.`,
              { duration: 5000 }
            );
          } else if (freshCredits?.planType === PlanType.BASIC) {
            toast.success(
              `🎉 Successfully subscribed to Basic plan! You now have ${freshCredits.credits.toLocaleString()} credits.`,
              { duration: 5000 }
            );
          } else {
            toast.success("Subscription updated successfully!");
          }

          onCreditsUpdate(freshCredits);
        } catch (error) {
          console.error("Failed to refresh credits after subscription:", error);
          toast.success("Subscription processed! Credits will update shortly.");
        }

        router.replace("/dashboard/settings");
      };

      handleSuccess();
    }

    if (canceled) {
      toast.info("Subscription update canceled");
      router.replace("/dashboard/settings");
    }
  }, [success, canceled, router, onCreditsUpdate]);
}

export interface UserCredits {
  credits: number;
  planType: PlanType;
}

export interface SubscriptionManagerProps {
  success?: string;
  canceled?: string;
}

export interface UseSubscriptionManagerReturn {
  userCredits: UserCredits | null;
  loading: boolean;
  checkoutLoading: string | null;
  handleSubscribe: (planType: PlanType.BASIC | PlanType.PRO) => Promise<void>;
  handleManageBilling: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

export function useSubscriptionManager({
  success,
  canceled,
}: SubscriptionManagerProps): UseSubscriptionManagerReturn {
  const { userCredits, loading, refreshCredits, setUserCredits } = useUserCredits();
  const { checkoutLoading, handleSubscribe, handleManageBilling } = useSubscriptionActions();

  // Handle success/cancel states
  useSubscriptionSuccess({
    success,
    canceled,
    onCreditsUpdate: setUserCredits,
  });

  return {
    userCredits,
    loading,
    checkoutLoading,
    handleSubscribe,
    handleManageBilling,
    refreshCredits,
  };
}
