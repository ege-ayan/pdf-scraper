import OpenAI from "openai";
import { resumeStructuredSchema } from "./schemas/openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 120000, // 2 minutes timeout for API calls
  maxRetries: 3,
});

export async function parseResumeWithOpenAI(imageUrls: string[]): Promise<any> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured in environment variables");
  }

  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Error("No image URLs provided for processing");
  }

  if (imageUrls.length > 50) {
    throw new Error(
      `Too many images provided: ${imageUrls.length}. Maximum allowed is 50.`
    );
  }

  console.log(
    `🤖 Starting AI resume parsing for ${imageUrls.length} images...`
  );

  const validateImageUrl = async (
    url: string,
    index: number,
    maxRetries = 3
  ): Promise<boolean> => {
    if (!url || typeof url !== "string") {
      throw new Error(`Invalid URL at index ${index}: ${url}`);
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🔍 Validating URL ${index} (attempt ${attempt}/${maxRetries}): ${url.substring(
            0,
            60
          )}...`
        );

        const response = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(10000), // Increased timeout to 10 seconds
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ResumeParser/1.0)",
          },
        });

        if (!response.ok) {
          console.warn(
            `⚠️ URL not accessible: ${url} - Status: ${response.status} (attempt ${attempt})`
          );

          // If it's the last attempt, return false
          if (attempt === maxRetries) {
            return false;
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
          continue;
        }

        // Check content type to ensure it's an image
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.startsWith("image/")) {
          console.warn(`⚠️ URL does not point to an image: ${contentType}`);
          return false;
        }

        // Check content length to ensure image is not too large (max 20MB for OpenAI)
        const contentLength = response.headers.get("content-length");
        if (contentLength) {
          const sizeInBytes = parseInt(contentLength, 10);
          const maxSizeBytes = 20 * 1024 * 1024; // 20MB

          if (sizeInBytes > maxSizeBytes) {
            console.warn(
              `⚠️ Image too large: ${sizeInBytes} bytes (max: ${maxSizeBytes} bytes)`
            );
            return false;
          }

          console.log(
            `📏 Image size: ${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`
          );
        }

        console.log(`✅ URL ${index} validated successfully`);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        if (attempt === maxRetries) {
          console.error(
            `❌ Failed to validate URL ${index} after ${maxRetries} attempts: ${url}`,
            errorMessage
          );
          return false;
        }

        console.warn(
          `⚠️ URL validation failed (attempt ${attempt}/${maxRetries}): ${errorMessage}`
        );

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    return false;
  };

  const validationPromises = imageUrls.map((url, index) =>
    validateImageUrl(url, index)
  );

  const validationResults = await Promise.all(validationPromises);
  const validUrls = imageUrls.filter((_, index) => validationResults[index]);

  if (validUrls.length === 0) {
    throw new Error(
      "Unable to access any resume images for processing. This could be due to network issues, large file sizes, or temporary service unavailability. Please try again with a smaller PDF file."
    );
  }

  if (validUrls.length < imageUrls.length) {
    const failedCount = imageUrls.length - validUrls.length;
    console.warn(
      `⚠️ ${failedCount} out of ${imageUrls.length} images failed validation and will be skipped. Proceeding with ${validUrls.length} valid images.`
    );

    // If we have less than half the images, warn the user
    if (validUrls.length < Math.ceil(imageUrls.length / 2)) {
      console.warn(
        `⚠️ Warning: Only ${validUrls.length} out of ${imageUrls.length} images are accessible. Results may be incomplete.`
      );
    }
  }

  console.log(`✅ Proceeding with ${validUrls.length} validated image URLs`);

  try {
    const messages: any[] = [
      {
        role: "system",
        content: `You are an expert at extracting structured data from resumes. Analyze the provided resume images and extract all information according to the required JSON schema. Be thorough and accurate in your extraction. If information is unclear or missing, use null values rather than guessing.`,
      },
      {
        role: "user",
        content: validUrls.map((imageUrl: string) => ({
          type: "image_url",
          image_url: {
            url: imageUrl,
            detail: "high",
          },
        })),
      },
    ];

    console.log("🚀 Sending request to OpenAI GPT-4o...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 4000,
      temperature: 0.1,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_extraction",
          schema: resumeStructuredSchema,
          strict: true,
        },
      },
    });

    console.log("✅ OpenAI response received");

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned empty response content");
    }

    if (!completion.choices[0]) {
      throw new Error("OpenAI returned no choices in response");
    }

    console.log("🔄 Parsing OpenAI JSON response...");

    let structuredData;
    try {
      structuredData = JSON.parse(content);
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response as JSON:", content);
      throw new Error("OpenAI response is not valid JSON");
    }

    if (!structuredData || typeof structuredData !== "object") {
      throw new Error("OpenAI response does not contain valid structured data");
    }

    console.log("✅ Resume parsing completed successfully");
    return structuredData;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("insufficient_quota")) {
        throw new Error(
          "OpenAI API quota exceeded. Please check your billing and try again later."
        );
      }
      if (error.message.includes("rate_limit")) {
        throw new Error(
          "OpenAI API rate limit exceeded. Please wait a few minutes and try again."
        );
      }
      if (error.message.includes("invalid_api_key")) {
        throw new Error(
          "OpenAI API key is invalid or expired. Please check your configuration."
        );
      }
      if (
        error.message.includes("timeout") ||
        error.message.includes("Timeout")
      ) {
        throw new Error(
          "Resume parsing timed out. This might be due to large images or network issues. Please try again with a smaller PDF file."
        );
      }
      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        throw new Error(
          "Network error occurred while processing your resume. Please check your internet connection and try again."
        );
      }
      if (
        error.message.includes("image") &&
        error.message.includes("download")
      ) {
        throw new Error(
          "Failed to download resume images for processing. The images might be too large or temporarily unavailable. Please try again."
        );
      }

      console.error("❌ OpenAI API error:", error.message);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }

    console.error("❌ Unknown error during OpenAI processing:", error);
    throw new Error(
      "Resume parsing failed due to an unexpected error. Please try again."
    );
  }
}
