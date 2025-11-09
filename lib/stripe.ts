import Stripe from "stripe";
import { prisma } from "./prisma";
import { PlanType } from "./types/enums";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const STRIPE_PRICES = {
  BASIC: process.env.STRIPE_PRICE_BASIC!,
  PRO: process.env.STRIPE_PRICE_PRO!,
} as const;

export const PLAN_CREDITS = {
  BASIC: 10000,
  PRO: 20000,
} as const;

export const CREDITS_PER_SCRAPE = 100;

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
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?canceled=true`,
    metadata: {
      userId,
      planType,
    },
  });

  return session;
}

export async function createPortalSession(customerId: string) {
  try {
    // Check if customer has active subscriptions before creating portal
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
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
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
    creditsToAdd = PLAN_CREDITS.BASIC;
    console.log(`Detected BASIC plan - adding ${creditsToAdd} credits`);
  } else if (priceId === STRIPE_PRICES.PRO) {
    planType = PlanType.PRO;
    creditsToAdd = PLAN_CREDITS.PRO;
    console.log(`Detected PRO plan - adding ${creditsToAdd} credits`);
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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planType: PlanType.FREE,
    },
  });

  console.log(`Downgraded user ${user.id} to FREE plan`);
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

  return user.credits - amount; // Return remaining credits
}

export async function getUserCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, planType: true },
  });

  return user;
}
