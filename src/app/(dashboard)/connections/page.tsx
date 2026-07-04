import { FollowBackPanel } from "@/components/connections/follow-back-panel";

import { ConnectionsSearch } from "@/components/connections/connections-search";

import { SuggestedUsers } from "@/components/connections/suggested-users";

import { getCurrentProfile } from "@/lib/data/profile";

import { getSuggestedUsers } from "@/lib/data/suggested-users";

import { serverFetchOptional } from "@/lib/api/server-client";

import type { UserProfile } from "@/types/models";



export const metadata = { title: "Connections" };



export default async function ConnectionsPage() {

  const user = await getCurrentProfile();

  const [following, followers, suggested] = await Promise.all([

    user?.id

      ? (await serverFetchOptional<UserProfile[]>(`/api/v1/following/${user.id}`)) ?? []

      : [],

    user?.id

      ? (await serverFetchOptional<UserProfile[]>(`/api/v1/followers/${user.id}`)) ?? []

      : [],

    getSuggestedUsers(),

  ]);

  const followingIds = following.map((u) => u.id);

  const followerSet = new Set(followers.map((u) => u.id));

  const mutualIds = followingIds.filter((id) => followerSet.has(id));



  return (

    <div className="space-y-8">

      <div className="space-y-2">

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">

          3D network

        </p>

        <h1 className="text-3xl font-bold text-white text-3d-glow">Connections</h1>

      </div>

      <FollowBackPanel followers={followers} followingIds={followingIds} />

      <SuggestedUsers

        initialUsers={suggested}

        initialFollowingIds={followingIds}

        initialMutualIds={mutualIds}

        currentUserId={user?.id}

      />

      <ConnectionsSearch

        initialFollowingIds={followingIds}

        initialMutualIds={mutualIds}

        currentUserId={user?.id}

      />

    </div>

  );

}

