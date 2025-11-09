import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import {
  stripe,
  handleSubscriptionUpdate,
  handleSubscriptionDelete,
} from "@/lib/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
      console.error("❌ Webhook signature missing");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`🎣 Received webhook: ${event.type} (ID: ${event.id})`);

    const result = await processWebhookEvent(event);

    const duration = Date.now() - startTime;
    console.log(`✅ Webhook processed in ${duration}ms`);

    return NextResponse.json({
      received: true,
      event: event.type,
      processed: result,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Webhook processing failed after ${duration}ms:`, error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        event: "unknown",
      },
      { status: 500 }
    );
  }
}

async function processWebhookEvent(event: Stripe.Event): Promise<boolean> {
  switch (event.type) {
    case "invoice.paid":
      return await handleInvoicePaid(event.data.object as Stripe.Invoice);

    case "customer.subscription.updated":
      return await handleSubscriptionUpdated(
        event.data.object as Stripe.Subscription
      );

    case "customer.subscription.deleted":
      return await handleSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      );

    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
      return false;
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<boolean> {
  try {
    console.log(`🔄 Processing subscription update: ${subscription.id}`);

    if (!subscription.customer || typeof subscription.customer !== "string") {
      console.error("❌ Invalid customer ID in subscription.updated");
      return false;
    }

    // Handle plan changes and adjust credits
    await handleSubscriptionUpdate(subscription.customer, subscription);

    console.log(`✅ Subscription updated: ${subscription.id}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to process subscription update: ${subscription.id}`,
      error
    );
    return false;
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<boolean> {
  try {
    console.log(`🗑️ Processing subscription deletion: ${subscription.id}`);

    if (!subscription.customer || typeof subscription.customer !== "string") {
      console.error("❌ Invalid customer ID in subscription.deleted");
      return false;
    }

    await handleSubscriptionDelete(subscription.customer);

    console.log(`✅ Subscription deactivated: ${subscription.id}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to process subscription deletion: ${subscription.id}`,
      error
    );
    return false;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<boolean> {
  console.log(`💰 Processing invoice payment - activating subscription and adding credits: ${invoice.id}`);

  if (!invoice.customer || typeof invoice.customer !== "string") {
    console.error("❌ Invalid customer ID in invoice.paid");
    return false;
  }

  // Find the subscription from the invoice
  let subscriptionId: string | null = null;

  const invoiceSubscription = (invoice as any).subscription;
  if (invoiceSubscription) {
    subscriptionId = typeof invoiceSubscription === "string"
      ? invoiceSubscription
      : invoiceSubscription.id;
  }

  if (!subscriptionId) {
    console.log(`🔍 No subscription reference in invoice, searching for active subscriptions...`);

    // For upgrades, the invoice might not have a direct subscription reference
    // Look for the most recent active subscription for this customer
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: invoice.customer,
        status: "active",
        limit: 5,
      });

      if (subscriptions.data.length > 0) {
        // Use the most recent subscription (first in the list, sorted by created date desc)
        subscriptionId = subscriptions.data[0].id;
        console.log(`✅ Found active subscription: ${subscriptionId}`);
      } else {
        console.log(`⚠️ No active subscriptions found for customer`);
        return true;
      }
    } catch (error) {
      console.error(`❌ Error searching for subscriptions:`, error);
      return false;
    }
  }

  console.log(`📋 Processing subscription ${subscriptionId} for invoice ${invoice.id}`);

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log(`📄 Subscription status: ${subscription.status}, plan: ${subscription.items.data[0]?.price.id}`);

  await handleSubscriptionUpdate(invoice.customer, subscription);

  console.log(`✅ Subscription activated and credits added: ${invoice.id}`);
  return true;
}
