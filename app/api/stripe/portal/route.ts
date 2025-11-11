import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPortalSessionForUser } from "@/lib/stripe";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await createPortalSessionForUser(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error!.message },
        { status: result.error!.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error("Portal session creation API error", error);
    return NextResponse.json(
      { message: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
