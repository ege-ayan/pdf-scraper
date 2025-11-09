import OpenAI from "openai";
import { resumeStructuredSchema } from "./schemas/openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

  const validationPromises = imageUrls.map(async (url, index) => {
    if (!url || typeof url !== "string") {
      throw new Error(`Invalid URL at index ${index}: ${url}`);
    }

    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.warn(
          `⚠️ URL not accessible: ${url} - Status: ${response.status}`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to validate URL ${index}: ${url}`, error);
      return false;
    }
  });

  const validationResults = await Promise.all(validationPromises);
  const validUrls = imageUrls.filter((_, index) => validationResults[index]);

  if (validUrls.length === 0) {
    throw new Error(
      "No accessible image URLs found. All URLs failed validation."
    );
  }

  if (validUrls.length < imageUrls.length) {
    console.warn(
      `⚠️ Only ${validUrls.length} out of ${imageUrls.length} URLs are accessible`
    );
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
          "OpenAI API quota exceeded. Please check your billing."
        );
      }
      if (error.message.includes("rate_limit")) {
        throw new Error(
          "OpenAI API rate limit exceeded. Please try again later."
        );
      }
      if (error.message.includes("invalid_api_key")) {
        throw new Error("OpenAI API key is invalid or expired.");
      }

      console.error("❌ OpenAI API error:", error.message);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }

    console.error("❌ Unknown error during OpenAI processing:", error);
    throw new Error("Resume parsing failed due to unknown error");
  }
}
