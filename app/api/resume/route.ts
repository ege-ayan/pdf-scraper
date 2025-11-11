import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getResumeHistory, createResume } from "@/lib/resume";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");

    const result = await getResumeHistory(session.user.id, page, limit);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error!.message },
        { status: result.error!.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error("Resume history API error", error);
    return NextResponse.json(
      { message: "Failed to fetch resume history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { fileName, imageUrls } = await request.json();

    const result = await createResume({
      fileName,
      imageUrls,
      userId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          message: result.error!.message,
          ...(result.error!.details && { ...result.error!.details }),
        },
        { status: result.error!.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error("Resume creation API error", error);
    return NextResponse.json(
      { message: "Failed to create resume" },
      { status: 500 }
    );
  }
}
