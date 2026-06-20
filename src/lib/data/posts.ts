import { getSessionUserId } from "@/lib/auth/session";
import { getFeedPostsForUser } from "@/lib/store";
import type { Post } from "@/types/models";

/** Feed posts for the signed-in student (in-memory, no database). */
export async function getFeedPosts(): Promise<Post[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];
  return getFeedPostsForUser(userId);
}
