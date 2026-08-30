import { createHash } from "node:crypto";

import { supabaseAdmin } from "../../lib/supabase.js";
import { getSafeErrorMessage } from "../../utils/api-responses.js";

export function createSourceFileHash(fileBuffer: Buffer) {
  return createHash("sha256").update(fileBuffer).digest("hex");
}

export function createPhotoDataUrl(buffer: Buffer, contentType: string) {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

export async function removeStoredResumeFile(filePath: string | null) {
  if (!filePath) return;

  const { error } = await supabaseAdmin.storage.from("resumes").remove([filePath]);
  if (error) {
    console.error(
      "Failed to clean up stored resume file -",
      getSafeErrorMessage(error)
    );
  }
}
