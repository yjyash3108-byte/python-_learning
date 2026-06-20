"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth/session";
import { createPostForUser } from "@/lib/store";
import { moderateContent } from "@/lib/moderation/moderateContent";
import { createPostSchema } from "@/lib/validation/grade";

export type PostActionState = {
  error?: string;
  success?: string;
};

/**
 * Creates a post after server-side moderation (in-memory store, no database).
 */
export async function createPost(
  _prev: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const parsed = createPostSchema.safeParse({
    content: formData.get("content"),
    category: formData.get("category"),
    imageUrls: [],
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const moderation = moderateContent(parsed.data.content);
  if (!moderation.allowed) {
    return { error: moderation.reason };
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return { error: "You must be signed in to post." };
  }

  const result = createPostForUser(userId, {
    content: parsed.data.content,
    category: parsed.data.category,
    imageUrls: parsed.data.imageUrls,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/feed");
  return { success: "Achievement shared!" };
}
