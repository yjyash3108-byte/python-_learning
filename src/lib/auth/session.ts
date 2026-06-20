import { cookies } from "next/headers";
import type { UserProfile } from "@/types/models";
import { getUserById } from "@/lib/store";

export const SESSION_COOKIE = "scholarnet_session";

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<UserProfile | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return getUserById(userId);
}

export async function setSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
