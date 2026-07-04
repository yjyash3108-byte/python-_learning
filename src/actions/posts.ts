"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api/server-client";
import { moderateContent } from "@/lib/moderation/moderateContent";
import { createPostSchema } from "@/lib/validation/grade";

export type PostActionState = {
  error?: string;
  success?: string;
};

export type CreatePostInput = {
  content: string;
  category: string;
  imageUrls?: string[];
  linkUrl?: string;
  hashtags?: string[];
};

export async function createPostData(
  input: CreatePostInput
): Promise<PostActionState> {
  const parsed = createPostSchema.safeParse({
    content: input.content,
    category: input.category,
    imageUrls: input.imageUrls ?? [],
    linkUrl: input.linkUrl?.trim() || undefined,
    hashtags: input.hashtags ?? [],
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const moderation = moderateContent(parsed.data.content);
  if (!moderation.allowed) {
    return { error: moderation.reason };
  }

  try {
    await serverFetch("/api/v1/posts", {
      method: "POST",
      body: JSON.stringify({
        content: parsed.data.content,
        category: parsed.data.category,
        image_urls: parsed.data.imageUrls ?? [],
        link_url: parsed.data.linkUrl || null,
        hashtags: parsed.data.hashtags ?? [],
      }),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create post" };
  }

  revalidatePath("/feed");
  return { success: "Your post was shared successfully!" };
}

export async function deletePost(postId: string): Promise<{ error?: string }> {
  try {
    await serverFetch(`/api/v1/posts/${postId}`, { method: "DELETE" });
    revalidatePath("/feed");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete post" };
  }
}
