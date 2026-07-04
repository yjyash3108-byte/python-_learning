import { redirect } from "next/navigation";
import { ApiError, serverFetch } from "@/lib/api/server-client";
import type { UserProfile } from "@/types/models";

type ApiUser = {
  id: string;
  email: string;
  username?: string | null;
  full_name: string;
  school_name: string;
  grade: number;
  city: string | null;
  bio: string;
  skills: string[];
  interests: string[];
  career_goals: string;
  profile_picture_url: string | null;
  social_links: Record<string, string> | null;
  is_verified: boolean;
  email_verified?: boolean;
  is_admin: boolean;
  onboarding_completed: boolean;
  created_at: string;
};

function mapUser(u: ApiUser): UserProfile {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    full_name: u.full_name,
    grade: u.grade,
    school_name: u.school_name,
    bio: u.bio ?? "",
    profile_picture_url: u.profile_picture_url,
    created_at: u.created_at,
    updated_at: u.created_at,
    city: u.city,
    skills: u.skills ?? [],
    interests: u.interests ?? [],
    career_goals: u.career_goals ?? "",
    social_links: u.social_links,
    is_verified: u.is_verified,
    email_verified: u.email_verified ?? u.is_verified,
    is_admin: u.is_admin ?? false,
    onboarding_completed: u.onboarding_completed ?? false,
  };
}

function redirectToClearSession(redirectTo?: string): never {
  const params = new URLSearchParams({ expired: "1" });
  if (redirectTo) params.set("redirect", redirectTo);
  const next = `/login?${params.toString()}`;
  redirect(`/api/auth/clear-session?next=${encodeURIComponent(next)}`);
}

/** Load the current user or redirect to login with session cleared. */
export async function requireProfile(redirectTo?: string): Promise<UserProfile> {
  try {
    const user = await serverFetch<ApiUser>("/api/v1/auth/me");
    return mapUser(user);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      redirectToClearSession(redirectTo);
    }
    if (e instanceof ApiError && e.status === 0) {
      redirect("/login?offline=1");
    }
    throw e;
  }
}

/** For the home page — returns profile or null without modifying cookies. */
export async function getSessionProfile(): Promise<UserProfile | null> {
  try {
    const user = await serverFetch<ApiUser>("/api/v1/auth/me");
    return mapUser(user);
  } catch {
    return null;
  }
}
