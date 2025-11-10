import { createClient } from "@supabase/supabase-js";
import { type UploadedImage } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const bucketName = "pdf-scraper";
const folderName = "resume-images";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImageToStorage(blob: Blob): Promise<UploadedImage> {
  try {
    const fileExt = "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded image");
    }

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

export async function uploadImagesToStorage(
  blobs: Blob[]
): Promise<UploadedImage[]> {
  const uploadPromises = blobs.map((blob) => uploadImageToStorage(blob));

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Multiple image upload error:", error);
    throw error;
  }
}
