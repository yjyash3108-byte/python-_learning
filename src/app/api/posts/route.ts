import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { createPostForUser } from "@/lib/store";
import { moderateContent } from "@/lib/moderation/moderateContent";
import { createPostSchema } from "@/lib/validation/grade";

/** REST endpoint for post creation (in-memory store, no database). */
export async function POST(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    );
  }

  const moderation = moderateContent(parsed.data.content);
  if (!moderation.allowed) {
    return NextResponse.json(
      { error: moderation.reason, flagged: moderation.flaggedPatterns },
      { status: 422 }
    );
  }

  const result = createPostForUser(userId, {
    content: parsed.data.content,
    category: parsed.data.category,
    imageUrls: parsed.data.imageUrls,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ post: result }, { status: 201 });
}
