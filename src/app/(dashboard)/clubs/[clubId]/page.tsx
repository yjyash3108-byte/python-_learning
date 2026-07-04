import { notFound } from "next/navigation";
import { ClubDetailContent } from "@/components/clubs/club-detail-content";
import { getClubAnnouncements, getClubEvents } from "@/lib/data/club-activity";
import { getClub, getClubAnalytics, getClubMembers, getClubPosts } from "@/lib/data/clubs";
import { getCurrentProfile } from "@/lib/data/profile";
import { getSubscriptionStatus } from "@/lib/data/subscription";

type PageProps = {
  params: Promise<{ clubId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { clubId } = await params;
  const club = await getClub(clubId);
  return { title: club ? club.name : "Club" };
}

export default async function ClubDetailPage({ params }: PageProps) {
  const { clubId } = await params;
  const [club, members, events, announcements, analytics, subscription, currentUser, posts] =
    await Promise.all([
      getClub(clubId),
      getClubMembers(clubId).catch(() => []),
      getClubEvents(clubId).catch(() => []),
      getClubAnnouncements(clubId).catch(() => []),
      getClubAnalytics(clubId).catch(() => null),
      getSubscriptionStatus(),
      getCurrentProfile(),
      getClubPosts(clubId).catch(() => []),
    ]);

  if (!club) notFound();

  return (
    <ClubDetailContent
      club={club}
      members={members}
      events={events}
      announcements={announcements}
      posts={posts}
      analytics={analytics}
      currentUserId={currentUser?.id ?? ""}
      isPro={subscription?.is_pro ?? false}
    />
  );
}
