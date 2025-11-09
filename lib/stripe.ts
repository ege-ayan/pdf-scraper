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

  // Check if user already has an active subscription and handle upgrades properly
  try {
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    console.log(
      `Found ${existingSubscriptions.data.length} active subscriptions for customer ${customerId}`
    );

    if (existingSubscriptions.data.length > 0) {
      // Check if upgrading from Basic to Pro
      const existingSub = existingSubscriptions.data[0];
      const existingPriceId = existingSub.items.data[0]?.price.id;

      if (planType === PlanType.PRO && existingPriceId === STRIPE_PRICES.BASIC) {
        // This is an upgrade: update existing subscription instead of cancelling
        console.log(`⬆️ Upgrading existing BASIC subscription ${existingSub.id} to PRO`);

        await stripe.subscriptions.update(existingSub.id, {
          items: [{
            id: existingSub.items.data[0].id,
            price: STRIPE_PRICES.PRO,
          }],
          proration_behavior: 'create_prorations',
        });

        // Return existing session info since we're updating, not creating new
        return {
          id: existingSub.id,
          url: `${process.env.NEXTAUTH_URL}/dashboard/settings?success=true`,
        };
      } else {
        // Cancel existing subscriptions for new purchases or downgrades
        for (const subscription of existingSubscriptions.data) {
          console.log(`Cancelling existing subscription: ${subscription.id}`);
          await stripe.subscriptions.cancel(subscription.id);
        }
      }
    }
  } catch (error) {
    console.error("Error handling existing subscriptions:", error);
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
  console.log(`🔄 Processing subscription update: ${subscription.id}`);

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`❌ User not found for customer ${customerId}`);
    return;
  }

  console.log(`✅ Found user: ${user.id} (${user.email})`);
  console.log(`   Current plan: ${user.planType}, Current credits: ${user.credits}`);

  const priceId = subscription.items.data[0]?.price.id;
  console.log(`Subscription price ID: ${priceId}`);

  let newPlanType = PlanType.FREE;

  if (priceId === STRIPE_PRICES.BASIC) {
    newPlanType = PlanType.BASIC;
    console.log(`📈 Plan changed to BASIC for user ${user.id}`);
  } else if (priceId === STRIPE_PRICES.PRO) {
    newPlanType = PlanType.PRO;
    console.log(`📈 Plan changed to PRO for user ${user.id}`);
  } else {
    console.log(`❓ Unknown price ID: ${priceId} - keeping current plan`);
    return;
  }

  // Handle plan changes: adjust credits accordingly
  let creditsAdjustment = 0;
  if (user.planType === PlanType.BASIC && newPlanType === PlanType.PRO) {
    // Upgrade from Basic to Pro: add the difference to reach PRO total
    creditsAdjustment = PLAN_CREDITS.PRO - PLAN_CREDITS.BASIC; // Add the difference (10k)
    console.log(`⬆️ Upgrading BASIC → PRO: adding ${creditsAdjustment} credits to existing ${user.credits}`);
  } else if (user.planType === PlanType.PRO && newPlanType === PlanType.BASIC) {
    // Downgrade from Pro to Basic: don't add credits
    creditsAdjustment = 0;
    console.log(`⬇️ Downgrading PRO → BASIC: keeping current credits ${user.credits}`);
  } else if (user.planType === PlanType.FREE && newPlanType === PlanType.BASIC) {
    // New Basic subscription: add Basic credits
    creditsAdjustment = PLAN_CREDITS.BASIC;
    console.log(`🆕 New BASIC subscription: adding ${creditsAdjustment} credits`);
  } else if (user.planType === PlanType.FREE && newPlanType === PlanType.PRO) {
    // New Pro subscription: add Pro credits
    creditsAdjustment = PLAN_CREDITS.PRO;
    console.log(`🆕 New PRO subscription: adding ${creditsAdjustment} credits`);
  }

  const newCredits = user.credits + creditsAdjustment;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planType: newPlanType,
      credits: newCredits,
    },
  });

  console.log(
    `✅ Updated user ${user.id}: plan=${newPlanType}, credits=${newCredits}`
  );
}

export async function handleInvoicePayment(customerId: string, subscriptionId: string) {
  console.log(`💰 Processing invoice payment for customer ${customerId}, subscription ${subscriptionId}`);

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error(`❌ User not found for customer ${customerId}`);
    return;
  }

  console.log(`✅ Found user: ${user.id} (${user.email})`);
  console.log(`   Current plan: ${user.planType}, Current credits: ${user.credits}`);

  // Get subscription details to determine plan type
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;

    let creditsToAdd = 0;

    if (priceId === STRIPE_PRICES.BASIC) {
      // Only add credits if user is currently FREE (initial subscription)
      if (user.planType === PlanType.FREE) {
        creditsToAdd = PLAN_CREDITS.BASIC;
        console.log(`💳 Initial BASIC subscription payment: adding ${creditsToAdd} credits`);
      } else {
        console.log(`💳 BASIC subscription payment: plan changes handled by subscription.updated`);
      }
    } else if (priceId === STRIPE_PRICES.PRO) {
      // Only add credits if user is currently FREE (initial subscription)
      if (user.planType === PlanType.FREE) {
        creditsToAdd = PLAN_CREDITS.PRO;
        console.log(`💳 Initial PRO subscription payment: adding ${creditsToAdd} credits`);
      } else {
        console.log(`💳 PRO subscription payment: plan changes handled by subscription.updated`);
      }
    } else {
      console.log(`❓ Unknown price ID in payment: ${priceId}`);
      return;
    }

    if (creditsToAdd > 0) {
      const newCredits = user.credits + creditsToAdd;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: newCredits,
        },
      });

      console.log(
        `✅ Payment processed: user ${user.id} credits updated from ${user.credits} to ${newCredits}`
      );
    }
  } catch (error) {
    console.error(`❌ Failed to retrieve subscription ${subscriptionId}:`, error);
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
    `🗑️ Deactivating subscription for user ${user.id}: plan=${user.planType} → FREE, credits=${user.credits} → 0 (freeze scraping)`
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planType: PlanType.FREE,
      credits: 0, // Freeze scraping by setting credits to 0
    },
  });

  console.log(
    `✅ Deactivated subscription for user ${user.id}: FREE plan with 0 credits (scraping frozen)`
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
