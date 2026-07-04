"use server";

import { revalidatePath } from "next/cache";
import { serverFetch } from "@/lib/api/server-client";

export async function updateProfileAction(data: {
  bio?: string;
  city?: string;
  skills?: string[];
  interests?: string[];
  career_goals?: string;
  social_links?: Record<string, string>;
  full_name?: string;
  school_name?: string;
  grade?: number;
  username?: string;
}): Promise<{ error?: string; success?: string }> {
  try {
    await serverFetch("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    revalidatePath("/profile");
    revalidatePath("/connections");
    revalidatePath("/opportunities");
    revalidatePath("/settings");
    return { success: "Profile updated" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Update failed" };
  }
}
