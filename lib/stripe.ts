import Stripe from "stripe";
import { prisma } from "./prisma";
import { logger } from "./logger";
import {
  PlanType,
  CreatePortalSessionResult,
  StripeWebhookEventType,
} from "@/types";
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

async function createOrRetrieveCustomer(userId: string, email: string) {
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

  const existingSubscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 5,
  });

  logger.info(
    `Found ${existingSubscriptions.data.length} active subscriptions for user ${userId}`
  );

  if (existingSubscriptions.data.length > 0) {
    const existingSub = existingSubscriptions.data[0];
    logger.info(`Updating subscription ${existingSub.id} to ${priceId}`);

    await stripe.subscriptions.update(existingSub.id, {
      items: [{ id: existingSub.items.data[0].id, price: priceId }],
      proration_behavior: "create_prorations",
    });

    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (user) {
      const planType =
        priceId === STRIPE_PRICES.PRO ? PlanType.PRO : PlanType.BASIC;
      const creditsToAdd =
        priceId === STRIPE_PRICES.PRO ? PLAN_CREDITS.PRO : PLAN_CREDITS.BASIC;
      const newCredits = user.credits + creditsToAdd;

      await prisma.user.update({
        where: { id: user.id },
        data: { planType, credits: newCredits },
      });
    }

    return {
      id: existingSub.id,
      url: `${process.env.NEXTAUTH_URL}/dashboard/settings?success=true`,
    };
  }

  logger.info(`Creating new checkout session for plan: ${planType}`);

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

async function createPortalSession(customerId: string) {
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
    logger.error(
      `Portal session creation failed for customer ${customerId}`,
      error
    );
    throw error;
  }
}

async function handleSubscriptionUpdate(
  customerId: string,
  subscription: Stripe.Subscription
) {
  logger.info(`Processing subscription update: ${subscription.id}`);

    if (!subscription.customer || typeof subscription.customer !== "string") {
      logger.error("Invalid customer ID in subscription update");
      return;
    }

    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      logger.error(`User not found for customer ${customerId}`);
      return;
    }

    logger.debug(`Found user: ${user.id} (${user.email})`);
    logger.debug(
      `Current plan: ${user.planType}, Current credits: ${user.credits}`
    );

  const priceId = subscription.items.data[0]?.price.id;

  let planType = PlanType.FREE;
  let creditsToAdd = 0;

    if (priceId === STRIPE_PRICES.BASIC) {
      planType = PlanType.BASIC;
      if (user.planType !== PlanType.BASIC) {
        creditsToAdd = PLAN_CREDITS.BASIC;
        logger.info(`Plan changed to BASIC - adding ${creditsToAdd} credits`);
      } else {
        logger.debug(`Plan is already BASIC - no credit change needed`);
      }
    } else if (priceId === STRIPE_PRICES.PRO) {
      planType = PlanType.PRO;

      if (user.planType !== PlanType.PRO) {
        creditsToAdd = PLAN_CREDITS.PRO;
        logger.info(`Plan changed to PRO - adding ${creditsToAdd} credits`);
      } else {
        logger.debug(`Plan is already PRO - no credit change needed`);
      }
    } else {
      logger.warn(`Unknown price ID: ${priceId} - keeping current plan`);
      return;
    }

  if (creditsToAdd > 0 || user.planType !== planType) {
    const newCredits = user.credits + creditsToAdd;
    logger.info(
      `Updating user ${user.id}: plan ${user.planType} → ${planType}, credits ${user.credits} + ${creditsToAdd} = ${newCredits}`
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        planType,
        credits: newCredits,
      },
    });

    logger.info(
      `Updated user ${user.id}: plan=${planType}, credits=${newCredits}`
    );
  } else {
    logger.debug(`No changes needed for user ${user.id}`);
  }
}

async function handleSubscriptionDelete(customerId: string) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    logger.error(`User not found for customer ${customerId}`);
    return;
  }

  logger.info(
    `Subscription cancelled for user ${user.id}: plan=${user.planType} → FREE, credits=${user.credits} → 0`
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planType: PlanType.FREE,
      credits: 0, // Reset credits to 0 on cancellation
    },
  });

  logger.info(
    `Cancelled subscription for user ${user.id}: FREE plan with 0 credits`
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

  if (user.stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        throw new Error(
          "No active subscription found. Please renew your subscription to continue using the service."
        );
      }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("active subscription")
        ) {
          throw error;
        }
        logger.error("Error checking subscription status", error);
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

export async function createPortalSessionForUser(
  userId: string
): Promise<CreatePortalSessionResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return {
        success: false,
        error: {
          message: "No active subscription found",
          status: 400,
        },
      };
    }

    const portalSession = await createPortalSession(user.stripeCustomerId);

    return {
      success: true,
      data: {
        url: portalSession.url,
      },
    };
  } catch (error: any) {
    logger.error("Portal session creation error", error);

    if (error.message?.includes("No active subscriptions found")) {
      return {
        success: false,
        error: {
          message:
            "No active subscription found. Please subscribe to a plan first.",
          status: 400,
        },
      };
    }

    return {
      success: false,
      error: {
        message: "Failed to create portal session",
        status: 500,
      },
    };
  }
}

async function handleSubscriptionUpdatedWebhook(
  subscription: Stripe.Subscription
): Promise<boolean> {
  try {
    logger.info(`Processing subscription update: ${subscription.id}`);

    if (!subscription.customer || typeof subscription.customer !== "string") {
      logger.error("Invalid customer ID in subscription update");
      return false;
    }

    await handleSubscriptionUpdate(subscription.customer, subscription);

    logger.info(`Subscription updated: ${subscription.id}`);
    return true;
  } catch (error) {
    logger.error(
      `Failed to process subscription update: ${subscription.id}`,
      error
    );
    return false;
  }
}

async function handleSubscriptionDeletedWebhook(
  subscription: Stripe.Subscription
): Promise<boolean> {
  try {
    logger.info(`Processing subscription deletion: ${subscription.id}`);

    if (!subscription.customer || typeof subscription.customer !== "string") {
      logger.error("Invalid customer ID in subscription deletion");
      return false;
    }

    await handleSubscriptionDelete(subscription.customer);

    logger.info(`Subscription deactivated: ${subscription.id}`);
    return true;
  } catch (error) {
    logger.error(
      `Failed to process subscription deletion: ${subscription.id}`,
      error
    );
    return false;
  }
}

async function handleInvoicePaidWebhook(
  invoice: Stripe.Invoice
): Promise<boolean> {
  logger.info(
    `Processing invoice payment - activating subscription and adding credits: ${invoice.id}`
  );

  if (!invoice.customer || typeof invoice.customer !== "string") {
    logger.error("Invalid customer ID in invoice payment");
    return false;
  }

  let subscriptionId: string | null = null;

  const invoiceSubscription = (invoice as any).subscription;
  if (invoiceSubscription) {
    subscriptionId =
      typeof invoiceSubscription === "string"
        ? invoiceSubscription
        : invoiceSubscription.id;
  }

  if (!subscriptionId) {
    logger.info(
      `No subscription reference in invoice, searching for active subscriptions`
    );

    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: invoice.customer,
        status: "active",
        limit: 5,
      });

      if (subscriptions.data.length > 0) {
        subscriptionId = subscriptions.data[0].id;
        logger.info(`Found active subscription: ${subscriptionId}`);
      } else {
        logger.warn(`No active subscriptions found for customer`);
        return true;
      }
    } catch (error) {
      logger.error(`Error searching for subscriptions`, error);
      return false;
    }
  }

  logger.info(
    `Processing subscription ${subscriptionId} for invoice ${invoice.id}`
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  logger.debug(
    `Subscription status: ${subscription.status}, plan: ${subscription.items.data[0]?.price.id}`
  );

  await handleSubscriptionUpdate(invoice.customer, subscription);

  logger.info(`Subscription activated and credits added: ${invoice.id}`);
  return true;
}

export async function processWebhookEvent(
  event: Stripe.Event
): Promise<boolean> {
  switch (event.type) {
    case StripeWebhookEventType.INVOICE_PAID:
      return await handleInvoicePaidWebhook(
        event.data.object as Stripe.Invoice
      );

    case StripeWebhookEventType.CUSTOMER_SUBSCRIPTION_UPDATED:
      return await handleSubscriptionUpdatedWebhook(
        event.data.object as Stripe.Subscription
      );

    case StripeWebhookEventType.CUSTOMER_SUBSCRIPTION_DELETED:
      return await handleSubscriptionDeletedWebhook(
        event.data.object as Stripe.Subscription
      );

    default:
      logger.warn(`Unhandled event type: ${event.type}`);
      return false;
  }
}
