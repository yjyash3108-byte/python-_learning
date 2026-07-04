import { serverFetchOptional, serverFetch } from "@/lib/api/server-client";
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

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await serverFetchOptional<ApiUser>("/api/v1/auth/me");
  return user ? mapUser(user) : null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await serverFetchOptional<ApiUser>(`/api/v1/users/${userId}`);
  return user ? mapUser(user) : null;
}

export type FollowStatus = {
  followers: number;
  following: number;
  is_following: boolean;
  is_self: boolean;
};

export async function getFollowStatus(userId: string): Promise<FollowStatus | null> {
  return serverFetchOptional<FollowStatus>(`/api/v1/follow/status/${userId}`);
}

export async function updateProfile(data: Partial<{
  full_name: string;
  school_name: string;
  grade: number;
  city: string;
  bio: string;
  skills: string[];
  interests: string[];
  social_links: Record<string, string>;
}>): Promise<UserProfile> {
  const user = await serverFetch<ApiUser>("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return mapUser(user);
}
