import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, processWebhookEvent } from "@/lib/stripe";
import { logger } from "@/lib/logger";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
      logger.error("Webhook signature missing");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      logger.error("Webhook signature verification failed", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    logger.webhook(event.type, event.id, false); // false because we don't know result yet

    const result = await processWebhookEvent(event);

    const duration = Date.now() - startTime;
    logger.apiResponse(`/api/webhooks/stripe`, "POST", 200, duration);

    return NextResponse.json({
      received: true,
      event: event.type,
      processed: result,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Webhook processing failed after ${duration}ms`, error);

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        event: "unknown",
      },
      { status: 500 }
    );
  }
}
