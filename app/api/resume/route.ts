import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeWithOpenAI } from "@/lib/openai";
import { deductCredits } from "@/lib/stripe";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resumeHistory = await prisma.resumeHistory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
      select: {
        id: true,
        fileName: true,
        uploadedAt: true,
        resumeData: true,
      },
    });

    return NextResponse.json(resumeHistory);
  } catch (error) {
    console.error("Fetch resume history error:", error);
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

    if (!fileName) {
      return NextResponse.json(
        { message: "fileName is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.credits < 100) {
      return NextResponse.json(
        {
          message:
            "Insufficient credits. Please upgrade your plan to continue.",
          credits: user.credits,
          required: 100,
        },
        { status: 402 }
      );
    }

    let resumeData;
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      console.log("Parsing resume with AI...");
      resumeData = await parseResumeWithOpenAI(imageUrls);
      console.log("Resume parsed successfully");

      await deductCredits(session.user.id, CREDITS_PER_SCRAPE);
      console.log("Credits deducted successfully");
    } else {
      return NextResponse.json(
        { message: "imageUrls array is required for parsing" },
        { status: 400 }
      );
    }

    const resumeHistory = await prisma.resumeHistory.create({
      data: {
        fileName,
        resumeData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: "Resume parsed and saved successfully",
      resumeHistory,
    });
  } catch (error) {
    console.error("Parse and save resume error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to parse and save resume";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
