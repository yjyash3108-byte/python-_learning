"use client";

import { ALLOWED_FILE_TYPES, MAX_FILE_BYTES } from "@/lib/achievements/constants";
import { apiUpload } from "@/lib/api/client";

export function validateDocumentFile(file: File | undefined): string | null {
  if (!file) return null;
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Only PDF, JPG, JPEG, and PNG files are allowed";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File must be under 10 MB";
  }
  return null;
}

export async function uploadDocument(file: File): Promise<string> {
  const error = validateDocumentFile(file);
  if (error) throw new Error(error);
  const formData = new FormData();
  formData.append("file", file);
  const result = await apiUpload<{ url: string }>("/uploads/document", formData);
  if (!result.url) throw new Error("Upload failed");
  return result.url;
}

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Image must be JPG, PNG, or WEBP");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");
  const formData = new FormData();
  formData.append("file", file);
  const result = await apiUpload<{ url: string | null }>("/uploads/image", formData);
  if (!result.url) throw new Error("Upload failed");
  return result.url;
}

export function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}
