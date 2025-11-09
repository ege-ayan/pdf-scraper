import axios from "axios";
import { uploadImagesToStorage } from "./supabase";
import {
  type ResumeData,
  type UploadedImage,
  type ProcessedResumeImages,
  ProcessingStep,
} from "./types";
import { MAX_FILE_SIZE } from "./constants";

export async function pdfToImages(file: File): Promise<Blob[]> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");

  GlobalWorkerOptions.workerSrc = "/scripts/pdfjs-worker.js";

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await getDocument({ data: typedArray }).promise;

        const imageBlobs: Blob[] = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Could not get canvas context");
          }

          const viewport = page.getViewport({ scale: 2.0 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          };

          await page.render(renderContext).promise;

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Failed to convert canvas to blob"));
                }
              },
              "image/jpeg",
              1.0
            );
          });

          imageBlobs.push(blob);
        }

        resolve(imageBlobs);
      } catch (error) {
        reject(new Error(`Failed to convert PDF to images: ${error}`));
      }
    };

    fileReader.onerror = () => {
      reject(new Error("Failed to read PDF file"));
    };

    fileReader.readAsArrayBuffer(file);
  });
}

export async function parseResumeWithAI(
  uploadedImages: UploadedImage[]
): Promise<ResumeData> {
  try {
    const response = await axios.post("/api/parse-resume", {
      imageUrls: uploadedImages.map((img) => img.url),
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`Resume parsing failed: ${message}`);
    }
    if (error instanceof Error) {
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
    throw new Error("Resume parsing failed: Unknown error");
  }
}

export async function processResumePDF(
  file: File,
  onProgress?: (step: ProcessingStep) => void
): Promise<ProcessedResumeImages> {
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size ${file.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes (10MB)`
    );
  }

  if (file.size === 0) {
    throw new Error("File is empty");
  }

  if (!file.type || file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  try {
    onProgress?.(ProcessingStep.CONVERTING);
    console.log(
      `Starting PDF processing for file: ${file.name} (${file.size} bytes)`
    );

    const imageBlobs = await pdfToImages(file);

    if (!imageBlobs || imageBlobs.length === 0) {
      throw new Error("PDF conversion failed: No pages found in PDF");
    }

    console.log(
      `✅ Successfully converted PDF to ${imageBlobs.length} image blobs`
    );

    onProgress?.(ProcessingStep.UPLOADING);
    console.log("Starting image upload process...");

    const uploadedImages = await uploadImagesToStorage(imageBlobs);

    if (!uploadedImages || uploadedImages.length === 0) {
      throw new Error("Image upload failed: No images were uploaded");
    }

    if (uploadedImages.length !== imageBlobs.length) {
      console.warn(
        `Warning: Expected ${imageBlobs.length} uploads but got ${uploadedImages.length}`
      );
    }

    console.log(
      `✅ Successfully uploaded ${uploadedImages.length} images to storage`
    );

    onProgress?.(ProcessingStep.READY);
    const imageUrls = uploadedImages.map((img) => img.url);
    const imagePaths = uploadedImages.map((img) => img.path);

    // Validate all URLs and paths are present
    const invalidUrls = imageUrls.filter(
      (url) => !url || typeof url !== "string"
    );
    const invalidPaths = imagePaths.filter(
      (path) => !path || typeof path !== "string"
    );

    if (invalidUrls.length > 0) {
      throw new Error(
        `Invalid image URLs generated: ${invalidUrls.length} invalid URLs`
      );
    }

    if (invalidPaths.length > 0) {
      throw new Error(
        `Invalid image paths generated: ${invalidPaths.length} invalid paths`
      );
    }

    console.log(
      `✅ PDF processing completed successfully with ${imageUrls.length} image URLs and ${imagePaths.length} paths`
    );

    return {
      imageUrls,
      imagePaths,
    };
  } catch (error) {
    console.error("❌ PDF processing failed:", error);
    throw error;
  }
}
