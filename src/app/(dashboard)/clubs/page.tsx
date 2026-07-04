import { ClubsBoard } from "@/components/clubs/clubs-board";
import { getClubLimits, getClubs, getMyClubs, getTrendingClubs } from "@/lib/data/clubs";
import { getSubscriptionStatus } from "@/lib/data/subscription";

export const metadata = { title: "Clubs" };

export default async function ClubsPage() {
  const [clubs, myClubs, trending, limits, subscription] = await Promise.all([
    getClubs(),
    getMyClubs(),
    getTrendingClubs(),
    getClubLimits(),
    getSubscriptionStatus(),
  ]);

  return (
    <ClubsBoard
      initialClubs={clubs}
      myClubs={myClubs}
      trendingClubs={trending}
      limits={limits}
      isPro={subscription?.is_pro ?? false}
    />
  );
}
