import { serverFetch, serverFetchOptional } from "@/lib/api/server-client";
import type { ClubAnalytics } from "@/types/club-analytics";
import type { Club, ClubDetail, ClubLimits, ClubMember } from "@/types/club";

export async function getClubs(q?: string, category?: string): Promise<Club[]> {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  const query = params.toString();
  return serverFetch<Club[]>(`/api/v1/clubs${query ? `?${query}` : ""}`);
}

export async function getMyClubs(): Promise<Club[]> {
  return serverFetch<Club[]>("/api/v1/clubs/my");
}

export async function getClubLimits(): Promise<ClubLimits | null> {
  return serverFetchOptional<ClubLimits>("/api/v1/clubs/limits");
}

export async function getClub(clubId: string): Promise<ClubDetail | null> {
  return serverFetchOptional<ClubDetail>(`/api/v1/clubs/${clubId}`);
}

export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
  return serverFetch<ClubMember[]>(`/api/v1/clubs/${clubId}/members`);
}

export async function getClubAnalytics(clubId: string): Promise<ClubAnalytics | null> {
  return serverFetchOptional<ClubAnalytics>(`/api/v1/clubs/${clubId}/analytics`);
}

export async function getTrendingClubs(): Promise<Club[]> {
  const data = await serverFetchOptional<Club[]>("/api/v1/clubs/trending");
  return data ?? [];
}

export async function getClubPosts(clubId: string) {
  const data = await serverFetchOptional<
    {
      id: string;
      club_id: string;
      author_id: string;
      author_name: string;
      content: string;
      created_at: string;
    }[]
  >(`/api/v1/clubs/${clubId}/posts`);
  return data ?? [];
}
