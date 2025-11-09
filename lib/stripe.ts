import Stripe from "stripe";
import { prisma } from "./prisma";
import { PlanType } from "@/types";
import {
  CREDITS_PER_SCRAPE,
  STRIPE_PRICES,
  PLAN_CREDITS,
  CHECKOUT_SUCCESS_URL,
  CHECKOUT_CANCEL_URL,
  SETTINGS_URL,
} from "./constants";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createOrRetrieveCustomer(userId: string, email: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  planType: PlanType.BASIC | PlanType.PRO
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const customerId =
    user.stripeCustomerId ||
    (await createOrRetrieveCustomer(userId, user.email));

  // Always go through Stripe Checkout for proper payment handling
  // Stripe will automatically handle upgrades with proration
  console.log(`Creating checkout session for plan: ${planType}`);

  // No existing subscriptions, create new checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: CHECKOUT_SUCCESS_URL,
    cancel_url: CHECKOUT_CANCEL_URL,
    metadata: {
      userId,
      planType,
    },
  });

  return session;
}

export async function createPortalSession(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscriptions found for this customer");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: SETTINGS_URL,
    });

    return session;
  } catch (error) {
    console.error(
      `Portal session creation failed for customer ${customerId}:`,
      error
    );
    throw error;
  }
}

export async function handleSubscriptionUpdate(
  customerId: string,
  subscription: Stripe.Subscription
) {
  console.log(`🔄 Processing subscription update: ${subscription.id}`);

  if (!subscription.customer || typeof subscription.customer !== "string") {
    console.error("❌ Invalid customer ID in subscription.updated");
    return;
  }

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`❌ User not found for customer ${customerId}`);
    return;
  }

  console.log(`✅ Found user: ${user.id} (${user.email})`);
  console.log(
    `   Current plan: ${user.planType}, Current credits: ${user.credits}`
  );

  const priceId = subscription.items.data[0]?.price.id;

  let planType = PlanType.FREE;
  let creditsToAdd = 0;

  if (priceId === STRIPE_PRICES.BASIC) {
    planType = PlanType.BASIC;
    // Only add credits if this is a plan change (upgrade/downgrade), not for existing plans
    if (user.planType !== PlanType.BASIC) {
      creditsToAdd = PLAN_CREDITS.BASIC;
      console.log(`📈 Plan changed to BASIC - adding ${creditsToAdd} credits`);
    } else {
      console.log(`📈 Plan is already BASIC - no credit change needed`);
    }
  } else if (priceId === STRIPE_PRICES.PRO) {
    planType = PlanType.PRO;
    // Only add credits if this is a plan change (upgrade/downgrade), not for existing plans
    if (user.planType !== PlanType.PRO) {
      creditsToAdd = PLAN_CREDITS.PRO;
      console.log(`📈 Plan changed to PRO - adding ${creditsToAdd} credits`);
    } else {
      console.log(`📈 Plan is already PRO - no credit change needed`);
    }
  } else {
    console.log(`❓ Unknown price ID: ${priceId} - keeping current plan`);
    return;
  }

  // Only update if there are actual changes
  if (creditsToAdd > 0 || user.planType !== planType) {
    const newCredits = user.credits + creditsToAdd;
    console.log(
      `Updating user ${user.id}: plan ${user.planType} → ${planType}, credits ${user.credits} + ${creditsToAdd} = ${newCredits}`
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        planType,
        credits: newCredits,
      },
    });

    console.log(
      `✅ Updated user ${user.id}: plan=${planType}, credits=${newCredits}`
    );
  } else {
    console.log(`ℹ️ No changes needed for user ${user.id}`);
  }
}

export async function handleSubscriptionDelete(customerId: string) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`User not found for customer ${customerId}`);
    return;
  }

  console.log(
    `🗑️ Deactivating subscription for user ${user.id}: plan=${user.planType} → FREE, credits=${user.credits} (preserved - scraping frozen by subscription status)`
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planType: PlanType.FREE,
      // Keep existing credits - scraping will be frozen by lack of active subscription
    },
  });

  console.log(
    `✅ Deactivated subscription for user ${user.id}: FREE plan with ${user.credits} credits preserved (scraping frozen)`
  );
}

export async function deductCredits(
  userId: string,
  amount: number = CREDITS_PER_SCRAPE
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has an active subscription
  if (user.stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        throw new Error("No active subscription found. Please renew your subscription to continue using the service.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("active subscription")) {
        throw error;
      }
      console.error("Error checking subscription status:", error);
      // If we can't check, allow the deduction (fail open)
    }
  }

  if (user.credits < amount) {
    throw new Error("Insufficient credits");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: user.credits - amount,
    },
  });

  return user.credits - amount;
}

export async function getUserCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, planType: true },
  });

  return user;
}
