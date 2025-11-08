"use client";

import { useMutation } from "@tanstack/react-query";
import { processResumePDF } from "@/lib/pdf-utils";
import { toast } from "sonner";

export function useResumeParser() {
  return useMutation({
    mutationFn: async (file: File) => {
      // Ensure we're on client side before processing PDF
      if (typeof window === "undefined") {
        throw new Error("PDF processing is only available on client side");
      }
      return await processResumePDF(file);
    },
    onSuccess: async (data, file) => {
      try {
        // Parse and save in one API call
        const saveResponse = await fetch("/api/resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            imageUrls: data.imageUrls, // Pass the image URLs for parsing
          }),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          throw new Error(errorData.message || "Failed to save resume");
        }

        toast.success("Resume parsed and saved successfully!");
        console.log("Resume processing complete");
      } catch (saveError) {
        console.error("Save error:", saveError);
        toast.error("Failed to save resume. Please try again.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
      console.error("Resume processing error:", error);
    },
  });
}
