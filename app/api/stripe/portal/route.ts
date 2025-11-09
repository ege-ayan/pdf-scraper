import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { message: "No active subscription found" },
        { status: 400 }
      );
    }

    const portalSession = await createPortalSession(user.stripeCustomerId);

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Portal session creation error:", error);

    if (error.message?.includes("No active subscriptions found")) {
      return NextResponse.json(
        {
          message:
            "No active subscription found. Please subscribe to a plan first.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
