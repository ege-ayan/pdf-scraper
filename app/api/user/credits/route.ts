import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserCredits } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userCredits = await getUserCredits(session.user.id);

    if (!userCredits) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userCredits);
  } catch (error) {
    console.error("Get user credits error:", error);
    return NextResponse.json(
      { message: "Failed to get user credits" },
      { status: 500 }
    );
  }
}
