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

  try {
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    console.log(
      `Found ${existingSubscriptions.data.length} active subscriptions for customer ${customerId}`
    );

    for (const subscription of existingSubscriptions.data) {
      console.log(`Cancelling existing subscription: ${subscription.id}`);
      await stripe.subscriptions.cancel(subscription.id);
    }
  } catch (error) {
    console.error("Error cancelling existing subscriptions:", error);
  }

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
  console.log(`🔍 Looking up user for Stripe customer: ${customerId}`);

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`❌ User not found for customer ${customerId}`);
    console.error(
      `   This means the user was not properly linked to their Stripe customer ID during checkout`
    );
    return;
  }

  console.log(`✅ Found user: ${user.id} (${user.email})`);
  console.log(
    `   Current plan: ${user.planType}, Current credits: ${user.credits}`
  );

  const priceId = subscription.items.data[0]?.price.id;
  console.log(`Subscription price ID: ${priceId}`);
  console.log(`Configured BASIC price: ${STRIPE_PRICES.BASIC}`);
  console.log(`Configured PRO price: ${STRIPE_PRICES.PRO}`);

  let planType = PlanType.FREE;
  let creditsToAdd = 0;

  if (priceId === STRIPE_PRICES.BASIC) {
    planType = PlanType.BASIC;
    // Only add credits if user is upgrading from FREE to BASIC
    if (user.planType === PlanType.FREE) {
      creditsToAdd = PLAN_CREDITS.BASIC;
      console.log(
        `Upgrading from FREE to BASIC - adding ${creditsToAdd} credits`
      );
    } else {
      console.log(
        `User already has ${user.planType} plan - not adding credits for BASIC`
      );
    }
  } else if (priceId === STRIPE_PRICES.PRO) {
    planType = PlanType.PRO;
    // Only add credits if user is upgrading from FREE to PRO, or BASIC to PRO
    if (user.planType === PlanType.FREE) {
      creditsToAdd = PLAN_CREDITS.PRO;
      console.log(
        `Upgrading from FREE to PRO - adding ${creditsToAdd} credits`
      );
    } else if (user.planType === PlanType.BASIC) {
      creditsToAdd = PLAN_CREDITS.PRO - PLAN_CREDITS.BASIC; // Add the difference
      console.log(
        `Upgrading from BASIC to PRO - adding ${creditsToAdd} credits (difference)`
      );
    } else {
      console.log(`User already has PRO plan - not adding additional credits`);
    }
  } else {
    console.log(`Unknown price ID: ${priceId} - keeping FREE plan`);
  }

  const newCredits = user.credits + creditsToAdd;
  console.log(
    `Updating user ${user.id}: plan=${planType}, credits=${user.credits} + ${creditsToAdd} = ${newCredits}`
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planType,
      credits: newCredits,
    },
  });

  console.log(
    `Successfully updated user ${user.id}: plan=${planType}, credits=${newCredits}`
  );
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
    `Downgrading user ${user.id}: plan=${user.planType} → FREE, credits=${user.credits} → 0`
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planType: PlanType.FREE,
      credits: 0, // Reset credits to freeze scraping access
    },
  });

  console.log(
    `✅ Downgraded user ${user.id} to FREE plan with 0 credits (scraping frozen)`
  );
}

export async function deductCredits(
  userId: string,
  amount: number = CREDITS_PER_SCRAPE
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) {
    throw new Error("User not found");
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
