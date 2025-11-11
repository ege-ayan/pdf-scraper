import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getResumeById, deleteResume } from "@/lib/resume";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await getResumeById(id, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error!.message },
        { status: result.error!.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    logger.error("Resume fetch API error", error);
    return NextResponse.json(
      { message: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await deleteResume(id, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error!.message },
        { status: result.error!.status }
      );
    }

    return NextResponse.json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    logger.error("Resume delete API error", error);
    return NextResponse.json(
      { message: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
