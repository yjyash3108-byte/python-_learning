import { getSessionUser } from "@/lib/auth/session";
import type { UserProfile } from "@/types/models";

export async function getCurrentProfile(): Promise<UserProfile | null> {
  return getSessionUser();
}
