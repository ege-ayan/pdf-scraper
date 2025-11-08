import { type ResumeData, type UploadedImage } from "./types";
import { uploadImagesToStorage } from "./supabase";

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

        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 5); pageNum++) {
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
              0.8
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
    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrls: uploadedImages.map((img) => img.url) }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
    throw new Error("Resume parsing failed: Unknown error");
  }
}

export interface ProcessedResumeImages {
  imageUrls: string[];
}

export async function processResumePDF(
  file: File
): Promise<ProcessedResumeImages> {
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size must be less than 10MB");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  console.log("Converting PDF to images...");
  const imageBlobs = await pdfToImages(file);

  if (imageBlobs.length === 0) {
    throw new Error("No pages found in PDF");
  }

  console.log(`Converted PDF to ${imageBlobs.length} image blobs`);

  console.log("Uploading images to storage...");
  const uploadedImages = await uploadImagesToStorage(imageBlobs);
  console.log(`Uploaded ${uploadedImages.length} images to storage`);

  const imageUrls = uploadedImages.map((img) => img.url);

  return {
    imageUrls,
  };
}
