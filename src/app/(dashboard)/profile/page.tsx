import { getCurrentProfile, getFollowStatus } from "@/lib/data/profile";

import { getDashboardStats } from "@/lib/data/dashboard";

import { getSubscriptionStatus } from "@/lib/data/subscription";

import { getMyAchievements } from "@/lib/data/achievements";

import { Badge } from "@/components/ui/badge";

import Link from "next/link";

import { Crown } from "lucide-react";

import { OwnProfileContent } from "@/components/profile/own-profile-content";



export const metadata = { title: "Profile" };



export default async function ProfilePage() {

  const profile = await getCurrentProfile();

  if (!profile) return null;



  const [stats, followStatus, subscription, achievements] = await Promise.all([

    getDashboardStats(),

    getFollowStatus(profile.id),

    getSubscriptionStatus(),

    getMyAchievements(),

  ]);



  const achievementSkills = achievements.flatMap((a) => a.skills_gained ?? []);



  const followData = followStatus ?? {

    followers: stats?.followers_count ?? 0,

    following: stats?.following_count ?? 0,

    is_following: false,

    is_self: true,

  };



  return (

    <div className="space-y-6">

      {subscription?.is_pro ? (

        <Badge className="gap-1 border-amber-400/30 bg-amber-500/15 text-amber-200">

          <Crown className="h-3 w-3" />

          ScholarNet Pro

        </Badge>

      ) : (

        <Link

          href="/upgrade"

          className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200 hover:bg-indigo-500/20"

        >

          <Crown className="h-4 w-4" />

          Upgrade to Pro

        </Link>

      )}

      <OwnProfileContent

        profile={profile}

        isPro={subscription?.is_pro ?? false}

        followStatus={{ ...followData, is_self: true }}

        achievementSkills={achievementSkills}

        stats={{

          projects_count: stats?.projects_count ?? 0,

          posts_count: stats?.posts_count ?? 0,

          achievements_count: stats?.achievements_count ?? 0,

        }}

      />

    </div>

  );

}

