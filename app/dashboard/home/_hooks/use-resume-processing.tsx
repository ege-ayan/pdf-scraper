"use client";

import axios from "axios";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useUserCredits } from "./use-user-credits";
import { processResumePDF } from "@/lib/pdf-utils";
import { ProcessingStep, ErrorType } from "@/lib/types/enums";
import { UseResumeProcessingReturn } from "@/lib/types";
import { CREDITS_PER_SCRAPE, MAX_FILE_SIZE } from "@/lib/constants";

function useResumeParser(onProgress?: (step: ProcessingStep) => void) {
  return useMutation({
    mutationFn: async (file: File) => {
      return await processResumePDF(file, onProgress);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      console.error("Resume processing error:", error);
    },
  });
}

function useResumeScraper() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      fileName,
      imageUrls,
    }: {
      fileName: string;
      imageUrls: string[];
    }) => {
      try {
        const response = await axios.post("/api/resume", {
          fileName,
          imageUrls,
        });

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const errorData = error.response?.data;

          if (status === 402) {
            throw {
              type: ErrorType.INSUFFICIENT_CREDITS,
              credits: errorData?.credits,
              required: errorData?.required,
            };
          }

          throw new Error(errorData?.message || "Failed to scrape resume");
        }

        if (error instanceof Error) {
          throw new Error(`Resume scraping failed: ${error.message}`);
        }

        throw new Error("Resume scraping failed: Unknown error");
      }
    },
    onSuccess: () => {
      toast.success("Resume scraped and saved successfully!");
      console.log("Resume scraping complete");
    },
    onError: (error: any) => {
      if (error?.type === ErrorType.INSUFFICIENT_CREDITS) {
        toast.error(`Insufficient credits! Please upgrade your plan.`, {
          action: {
            label: "Upgrade",
            onClick: () => router.push("/dashboard/settings"),
          },
          duration: 8000,
        });
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to scrape resume. Please try again."
        );
      }
      console.error("Resume scraping error:", error);
    },
  });
}

export function useResumeProcessing(): UseResumeProcessingReturn {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>(
    ProcessingStep.IDLE
  );

  const resumeParser = useResumeParser((step) => setCurrentStep(step));
  const resumeScraper = useResumeScraper();
  const { data: userCredits, isLoading: creditsLoading } = useUserCredits();

  const isProcessing = resumeParser.isPending || resumeScraper.isPending;
  const canStartProcessing = Boolean(
    selectedFile &&
      currentStep === ProcessingStep.IDLE &&
      !isProcessing &&
      !creditsLoading &&
      userCredits
  );

  const hasFile = Boolean(selectedFile);
  const isComplete = currentStep === ProcessingStep.COMPLETE;
  const isIdle = currentStep === ProcessingStep.IDLE;

  const selectFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setSelectedFile(file);
    setCurrentStep(ProcessingStep.IDLE);
  }, []);

  const validateCredits = useCallback((): boolean => {
    if (creditsLoading) {
      toast.error("Loading credits information. Please wait.");
      return false;
    }

    if (!userCredits) {
      toast.error("Failed to check credits. Please try again.");
      return false;
    }

    if (userCredits.credits < CREDITS_PER_SCRAPE) {
      toast.error(`Insufficient credits! Please upgrade your plan.`, {
        action: {
          label: "Upgrade",
          onClick: () => router.push("/dashboard/settings"),
        },
        duration: 8000,
      });
      return false;
    }

    return true;
  }, [userCredits, creditsLoading, router]);

  const startProcessing = useCallback(async (): Promise<void> => {
    if (!selectedFile || !canStartProcessing) {
      return;
    }

    if (!validateCredits()) {
      return;
    }

    try {
      const processedImages = await resumeParser.mutateAsync(selectedFile);

      setCurrentStep(ProcessingStep.SCRAPING);
      await resumeScraper.mutateAsync({
        fileName: selectedFile.name,
        imageUrls: processedImages.imageUrls,
      });

      setCurrentStep(ProcessingStep.COMPLETE);
    } catch (error) {
      setCurrentStep(ProcessingStep.IDLE);
      throw error;
    }
  }, [
    selectedFile,
    canStartProcessing,
    validateCredits,
    resumeParser,
    resumeScraper,
  ]);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setCurrentStep(ProcessingStep.IDLE);
  }, []);

  return {
    selectedFile,
    currentStep,
    isProcessing,

    selectFile,
    startProcessing,
    reset,

    canStartProcessing,
    hasFile,
    isComplete,
    isIdle,
  };
}
