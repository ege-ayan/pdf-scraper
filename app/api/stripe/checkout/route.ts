import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { STRIPE_PRICES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { planType } = await request.json();

    if (!planType || !["BASIC", "PRO"].includes(planType)) {
      return NextResponse.json(
        { message: "Invalid plan type. Must be BASIC or PRO" },
        { status: 400 }
      );
    }

    const priceId =
      planType === "BASIC" ? STRIPE_PRICES.BASIC : STRIPE_PRICES.PRO;

    if (!priceId) {
      return NextResponse.json(
        { message: "Stripe price not configured" },
        { status: 500 }
      );
    }

    const checkoutSession = await createCheckoutSession(
      session.user.id,
      priceId,
      planType
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
