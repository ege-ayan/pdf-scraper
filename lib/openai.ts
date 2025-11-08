import OpenAI from "openai";
import { resumeStructuredSchema } from "./schemas/openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseResumeWithOpenAI(imageUrls: string[]): Promise<any> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const messages: any[] = [
    {
      role: "system",
      content: `You are an expert at extracting structured data from resumes. Analyze the provided resume images and extract all information according to the required JSON schema. Be thorough and accurate in your extraction.`,
    },
    {
      role: "user",
      content: imageUrls.map((imageUrl: string) => ({
        type: "image_url",
        image_url: {
          url: imageUrl,
          detail: "high",
        },
      })),
    },
  ];

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

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const structuredData = JSON.parse(content);
  return structuredData;
}
