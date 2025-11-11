import { prisma } from "./prisma";
import { parseResumeWithOpenAI } from "./openai";
import { deductCredits } from "./stripe";
import { CREDITS_PER_SCRAPE } from "./constants";
import { logger } from "./logger";
import type {
  CreateResumeParams,
  CreateResumeResult,
  GetResumeHistoryResult,
  GetResumeByIdResult,
  DeleteResumeResult,
} from "@/types/resume";

export async function getResumeHistory(
  userId: string
): Promise<GetResumeHistoryResult> {
  try {
    const resumeHistory = await prisma.resumeHistory.findMany({
      where: {
        userId,
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

    return {
      success: true,
      data: resumeHistory,
    };
  } catch (error) {
    logger.error("Fetch resume history error", error);
    return {
      success: false,
      error: {
        message: "Failed to fetch resume history",
        status: 500,
      },
    };
  }
}

export async function createResume(
  params: CreateResumeParams
): Promise<CreateResumeResult> {
  try {
    const { fileName, imageUrls, userId } = params;

    if (!fileName) {
      return {
        success: false,
        error: {
          message: "fileName is required",
          status: 400,
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      return {
        success: false,
        error: {
          message: "User not found",
          status: 404,
        },
      };
    }

    if (user.credits < CREDITS_PER_SCRAPE) {
      return {
        success: false,
        error: {
          message:
            "Insufficient credits. Please upgrade your plan to continue.",
          status: 402,
          details: {
            credits: user.credits,
            required: CREDITS_PER_SCRAPE,
          },
        },
      };
    }

    let resumeData;
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      logger.info("Parsing resume with AI");
      resumeData = await parseResumeWithOpenAI(imageUrls);
      logger.info("Resume parsed successfully");

      await deductCredits(userId, CREDITS_PER_SCRAPE);
      logger.info("Credits deducted successfully");
    } else {
      return {
        success: false,
        error: {
          message: "imageUrls array is required for parsing",
          status: 400,
        },
      };
    }

    const resumeHistory = await prisma.resumeHistory.create({
      data: {
        fileName,
        resumeData,
        userId,
      },
    });

    return {
      success: true,
      data: {
        message: "Resume parsed and saved successfully",
        resumeHistory,
      },
    };
  } catch (error) {
    logger.error("Parse and save resume error", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to parse and save resume";

    return {
      success: false,
      error: {
        message: errorMessage,
        status: 500,
      },
    };
  }
}

export async function getResumeById(
  resumeId: string,
  userId: string
): Promise<GetResumeByIdResult> {
  try {
    const resume = await prisma.resumeHistory.findFirst({
      where: {
        id: resumeId,
        userId,
      },
      select: {
        id: true,
        fileName: true,
        uploadedAt: true,
        resumeData: true,
      },
    });

    if (!resume) {
      return {
        success: false,
        error: {
          message: "Resume not found",
          status: 404,
        },
      };
    }

    return {
      success: true,
      data: resume,
    };
  } catch (error) {
    logger.error("Fetch resume error", error);
    return {
      success: false,
      error: {
        message: "Failed to fetch resume",
        status: 500,
      },
    };
  }
}

export async function deleteResume(
  resumeId: string,
  userId: string
): Promise<DeleteResumeResult> {
  try {
    const resume = await prisma.resumeHistory.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      return {
        success: false,
        error: {
          message: "Resume not found",
          status: 404,
        },
      };
    }

    await prisma.resumeHistory.delete({
      where: {
        id: resumeId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Delete resume error", error);
    return {
      success: false,
      error: {
        message: "Failed to delete resume",
        status: 500,
      },
    };
  }
}
