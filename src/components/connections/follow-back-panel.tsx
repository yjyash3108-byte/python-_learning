"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { FollowButton } from "@/components/profile/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { UserProfile } from "@/types/models";

type FollowBackPanelProps = {
  followers: UserProfile[];
  followingIds: string[];
};

export function FollowBackPanel({ followers, followingIds }: FollowBackPanelProps) {
  const followingSet = new Set(followingIds);
  const toFollowBack = followers.filter((u) => !followingSet.has(u.id));

  return (
    <GlassPanel depth="md" tilt className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/25 text-indigo-200 panel-3d-depth">
          <UserPlus className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Follow back</h2>
          <p className="text-sm text-muted-foreground">
            Students who follow you — follow back to unlock messaging.
          </p>
        </div>
      </div>

      {toFollowBack.length === 0 ? (
        <p className="text-sm text-slate-300">
          No pending follow-backs. When someone follows you, they&apos;ll appear here.
        </p>
      ) : (
        <ul className="space-y-3">
          {toFollowBack.slice(0, 8).map((user) => {
            const initials = user.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3"
              >
                <Link href={`/profile/${user.id}`} className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile_picture_url ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Class {user.grade} · {user.school_name}
                    </p>
                  </div>
                </Link>
                <FollowButton userId={user.id} initialIsFollowing={false} size="sm" />
              </li>
            );
          })}
        </ul>
      )}
    </GlassPanel>
  );
}
