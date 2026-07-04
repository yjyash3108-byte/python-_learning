import { serverFetch } from "@/lib/api/server-client";
import type { ClubAnnouncement, ClubEvent } from "@/types/club-activity";

export async function getClubEvents(clubId: string): Promise<ClubEvent[]> {
  return serverFetch<ClubEvent[]>(`/api/v1/clubs/${clubId}/events`);
}

export async function getClubAnnouncements(clubId: string): Promise<ClubAnnouncement[]> {
  return serverFetch<ClubAnnouncement[]>(`/api/v1/clubs/${clubId}/announcements`);
}
